"""Configuration de l'application Django membres."""

from django.apps import AppConfig


class MembresConfig(AppConfig):
    """Declare l'application et le type d'identifiant par defaut."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'membres'
