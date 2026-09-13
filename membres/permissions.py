"""Permissions DRF reutilisables basees sur le role metier."""

from rest_framework.permissions import BasePermission


class HasRole(BasePermission):
    """Autorise uniquement les utilisateurs actifs dont le role est accepte."""
    allowed_roles = ()

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_active
            and request.user.role in self.allowed_roles
        )


class IsEnseignant(HasRole):
    """Permission reservee aux enseignants."""
    allowed_roles = ('ENSEIGNANT',)


class IsParent(HasRole):
    """Permission reservee aux parents."""
    allowed_roles = ('PARENT',)


class IsDirecteur(HasRole):
    """Permission reservee aux administrateurs."""
    allowed_roles = ('ADMIN',)
