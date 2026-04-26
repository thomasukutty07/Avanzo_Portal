from core.asgi_middleware import FirstMessageAuthConsumer
from core.constants import RoleNames


class ActivityFeedConsumer(FirstMessageAuthConsumer):
    async def on_authenticated(self):
        user = self.scope["user"]
        self.groups_joined = []

        # Everyone gets their own personal activity stream
        personal_group = f"user_{user.id}_activity"
        await self.channel_layer.group_add(personal_group, self.channel_name)
        self.groups_joined.append(personal_group)

        # Team Leads get department activity stream
        if user.role_name == RoleNames.TEAM_LEAD and user.department_id:
            dept_group = f"dept_{user.department_id}_activity"
            await self.channel_layer.group_add(dept_group, self.channel_name)
            self.groups_joined.append(dept_group)

        # Admin and HR get the org-wide activity stream
        if user.role_name in [RoleNames.ADMIN, RoleNames.HR]:
            org_group = "org_activity"
            await self.channel_layer.group_add(org_group, self.channel_name)
            self.groups_joined.append(org_group)

        await self.send_json({"message": f"Subscribed to {len(self.groups_joined)} streams"})

    async def disconnect(self, close_code):
        if hasattr(self, "groups_joined"):
            for group in self.groups_joined:
                await self.channel_layer.group_discard(group, self.channel_name)

    async def activity_push(self, event):
        """Handler for 'activity_push' type messages sent via channel layer."""
        await self.send_json({"type": "activity", "data": event.get("data", {})})
