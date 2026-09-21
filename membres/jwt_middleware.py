from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken


@database_sync_to_async
def _user_from_token(token):
    try:
        print("TOKEN REÇU :", token[:30] if token else None)

        validated_token = AccessToken(token)

        print("TOKEN VALIDE")
        print("USER ID :", validated_token["user_id"])

        user = get_user_model().objects.get(
            id=validated_token["user_id"],
            is_active=True,
        )

        print("UTILISATEUR :", user)
        print("AUTHENTICATED :", user.is_authenticated)

        return user

    except Exception as e:
        print("ERREUR JWT WEBSOCKET :", type(e).__name__, e)
        return None


class JWTAuthMiddleware:

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):

        query_string = scope.get("query_string", b"").decode("utf-8")

        print("QUERY STRING :", query_string)

        token = parse_qs(query_string).get("token", [None])[0]

        print("TOKEN TROUVÉ :", bool(token))

        if token:
            scope["user"] = await _user_from_token(token)
        else:
            scope["user"] = None

        print("SCOPE USER :", scope["user"])

        return await self.app(scope, receive, send)