"""Diffusion des notifications vers le groupe WebSocket d'un utilisateur."""

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def publish_user_event(user_id, payload):
    """Publie un événement sur le canal personnel d'un utilisateur."""
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        f'user_{user_id}',
        {'type': 'notification.message', 'payload': payload},
    )
