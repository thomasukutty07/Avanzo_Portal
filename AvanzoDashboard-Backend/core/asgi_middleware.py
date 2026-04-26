import logging

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.db import connection
from django_tenants.utils import get_tenant_domain_model, tenant_context
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken

from accounts.models import Employee

logger = logging.getLogger(__name__)


# 1. Tenant Resolution Middleware
class TenantASGIAuthMiddleware:
    """
    Resolves the tenant via the Host header and validates the JWT if provided via
    query params (Option A) or in this case, we just resolve the tenant, and defer
    auth to the first message (Option B).
    Actually, we'll implement a clean First Message workflow in the Consumer base class.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Extract host
        host = ""
        for name, value in scope.get("headers", []):
            if name == b"host":
                host = value.decode("utf-8")
                break

        hostname = host.split(":")[0]

        # Resolve tenant
        tenant = await self.get_tenant(hostname)
        scope["tenant"] = tenant
        scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)

    @sync_to_async
    def get_tenant(self, hostname):
        Domain = get_tenant_domain_model()
        try:
            domain = Domain.objects.select_related("tenant").get(domain=hostname)
            return domain.tenant
        except Domain.DoesNotExist:
            return None


# 2. Base Consumer with First Message Auth
class FirstMessageAuthConsumer(AsyncJsonWebsocketConsumer):
    """
    Option B implementation.
    Accepts connection immediately. Waits for `{"action": "authenticate", "token": "..."}`.
    If no valid auth received within the first message, closes connection.
    """

    async def connect(self):
        self.is_authenticated = False
        self.tenant = self.scope.get("tenant")

        if not self.tenant:
            logger.warning("WebSocket rejected: No tenant found for host")
            await self.close(code=4004)
            return

        # Accept connection initially to wait for auth message
        await self.accept()

    async def receive_json(self, content, **kwargs):
        if not self.is_authenticated:
            # The FIRST message must be the authenticate action
            if content.get("action") == "authenticate" and "token" in content:
                user = await self.authenticate_token(content["token"])
                if user and not isinstance(user, AnonymousUser):
                    self.is_authenticated = True
                    self.scope["user"] = user
                    await self.send_json({"status": "authenticated"})
                    # Trigger subclass hook
                    await self.on_authenticated()
                else:
                    await self.send_json({"error": "Invalid token"})
                    await self.close(code=4001)
            else:
                await self.send_json({"error": "Auth required"})
                await self.close(code=4001)
            return

        # If authenticated, pass to standard handler
        await super().receive_json(content, **kwargs)

    async def on_authenticated(self):
        """Hook for subclasses to join groups after auth."""
        pass

    @sync_to_async
    def authenticate_token(self, token_string):
        """Validates JWT and returns User, scoped to the resolved tenant schema."""
        with tenant_context(self.tenant):
            try:
                token = AccessToken(token_string)
                user = Employee.objects.get(id=token["user_id"])

                # SECURITY: Verify the user actually belongs to THIS tenant's schema.
                # Without this check, a valid JWT from Tenant-A could authenticate
                # on Tenant-B's WebSocket if UUIDs happen to collide.
                if connection.schema_name != self.tenant.schema_name:
                    logger.warning(
                        "WebSocket tenant mismatch: token schema=%s, tenant schema=%s",
                        connection.schema_name,
                        self.tenant.schema_name,
                    )
                    return AnonymousUser()

                if user.is_active:
                    return user
            except (InvalidToken, TokenError, Employee.DoesNotExist, KeyError):
                pass
        return AnonymousUser()

