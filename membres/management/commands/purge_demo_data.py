"""Commande de suppression controlee des donnees de demonstration."""

from django.core.management.base import BaseCommand
from django.db import transaction

from membres.models import Classe, Eleve, Utilisateur


class Command(BaseCommand):
    """Supprime uniquement les comptes demo et leurs relations associees."""
    help = 'Supprime uniquement les utilisateurs et donnees de demonstration.'

    def handle(self, *args, **options):
        with transaction.atomic():
            demo_users = Utilisateur.objects.filter(
                username__in=list(Utilisateur.objects.filter(
                    username__startswith='parent_demo_'
                ).values_list('username', flat=True)) + list(Utilisateur.objects.filter(
                    username__startswith='enseignant_demo_'
                ).values_list('username', flat=True))
            )
            deleted_classes, _ = Classe.objects.filter(enseignant__in=demo_users).delete()
            deleted_students, _ = Eleve.objects.filter(parent__in=demo_users).delete()
            deleted_users, _ = demo_users.delete()

        self.stdout.write(self.style.SUCCESS(
            f'Donnees demo supprimees: {deleted_users} utilisateurs, '
            f'{deleted_students} eleves, {deleted_classes} classes.'
        ))