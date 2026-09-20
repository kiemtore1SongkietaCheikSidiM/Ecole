from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken


@database_sync_to_async
def _user_from_token(token):
    try:
        validated_token = AccessToken(token)
        return get_user_model().objects.get(
            id=validated_token['user_id'],
            is_active=True,
        )
    except Exception:
        return None


class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode('utf-8')
        token = parse_qs(query_string).get('token', [None])[0]
        scope['user'] = await _user_from_token(token) if token else None
        return await self.app(scope, receive, send)
