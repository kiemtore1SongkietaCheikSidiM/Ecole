"""Cree le superutilisateur configure dans les variables d'environnement."""

import os
from django.core.management.base import BaseCommand


def create_admin_user():
    """Initialise Django puis cree l'administrateur s'il n'existe pas."""
    import django
    from django.conf import settings
    from django.contrib.auth import get_user_model

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Taslim.settings')
    django.setup()

    User = get_user_model()
    username = os.getenv('ADMIN_USERNAME', 'admin')
    email = os.getenv('ADMIN_EMAIL', 'admin@alfarouk.local')
    password = os.getenv('ADMIN_PASSWORD', 'Admin123!')

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password, role='ADMIN', nom='Admin', prenom='Principal')
        print(f"Admin créé: {username}")
    else:
        print(f"L’utilisateur admin existe déjà: {username}")


if __name__ == '__main__':
    create_admin_user()
