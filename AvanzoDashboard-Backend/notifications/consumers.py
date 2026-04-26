from core.asgi_middleware import FirstMessageAuthConsumer


class NotificationConsumer(FirstMessageAuthConsumer):
    async def on_authenticated(self):
        user = self.scope["user"]
        self.group_name = f"user_{user.id}_notifications"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.send_json({"message": f"Subscribed to {self.group_name}"})

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notification_push(self, event):
        """Handler for 'notification_push' type messages sent via channel layer."""
        await self.send_json({"type": "notification", "data": event.get("data", {})})
