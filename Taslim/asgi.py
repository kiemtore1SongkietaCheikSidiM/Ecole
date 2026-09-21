"""Point d'entree ASGI du projet Taslim.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Taslim.settings")

django_application = get_asgi_application()

from membres.jwt_middleware import JWTAuthMiddleware
from membres.routing import websocket_urlpatterns


application = ProtocolTypeRouter({
    "http": django_application,

    "websocket": JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})