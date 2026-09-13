"""Configuration de l'interface d'administration Django."""

from django.contrib import admin
from .models import Absence, Classe, Devoir, Eleve, EmploiDuTemps, Evenement, Message, Notification, Retard, Utilisateur


class EleveInline(admin.TabularInline):
    model = Eleve
    extra = 0
    fields = ['nom', 'prenom', 'classe']


class ClasseInline(admin.TabularInline):
    model = Classe
    extra = 0
    fields = ['nom', 'matiere']


@admin.register(Utilisateur)
class UtilisateurAdmin(admin.ModelAdmin):
    list_display = ['username', 'role', 'nom', 'prenom', 'email', 'telephone', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['username', 'nom', 'prenom', 'email', 'telephone']
    inlines = [EleveInline, ClasseInline]


@admin.register(Eleve)
class EleveAdmin(admin.ModelAdmin):
    list_display = ['nom', 'prenom', 'classe', 'parent']
    list_filter = ['classe']
    search_fields = ['nom', 'prenom', 'classe', 'parent__username']


@admin.register(Classe)
class ClasseAdmin(admin.ModelAdmin):
    list_display = ['nom', 'matiere', 'enseignant']
    list_filter = ['nom', 'matiere']
    search_fields = ['nom', 'matiere', 'enseignant__username']


@admin.register(EmploiDuTemps)
class EmploiDuTempsAdmin(admin.ModelAdmin):
    list_display = ['classe', 'jour', 'heure_debut', 'heure_fin', 'salle']
    list_filter = ['jour', 'classe__nom']
    search_fields = ['classe__nom', 'classe__matiere', 'salle']


@admin.register(Absence)
class AbsenceAdmin(admin.ModelAdmin):
    list_display = ['date', 'eleve', 'enseignant', 'motif']
    list_filter = ['date', 'enseignant']
    search_fields = ['eleve__nom', 'eleve__prenom', 'eleve__classe', 'motif']


@admin.register(Retard)
class RetardAdmin(admin.ModelAdmin):
    list_display = ['date', 'eleve', 'enseignant', 'minutes', 'motif']
    list_filter = ['date', 'enseignant']
    search_fields = ['eleve__nom', 'eleve__prenom', 'eleve__classe', 'motif']


@admin.register(Devoir)
class DevoirAdmin(admin.ModelAdmin):
    list_display = ['date', 'eleve', 'matiere', 'composition', 'enseignant', 'nom_fichier']
    list_filter = ['date', 'matiere', 'enseignant']
    search_fields = ['eleve__nom', 'eleve__prenom', 'eleve__classe', 'matiere', 'nom_fichier']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['date_envoi', 'emetteur', 'destinataire', 'contenu']
    list_filter = ['date_envoi']
    search_fields = ['emetteur__username', 'destinataire__username', 'contenu']


@admin.register(Evenement)
class EvenementAdmin(admin.ModelAdmin):
    list_display = ['date', 'titre', 'created_by', 'created_at']
    list_filter = ['date']
    search_fields = ['titre', 'contenu']
    readonly_fields = ['created_by', 'created_at']

    def save_model(self, request, obj, form, change):
        if not obj.created_by_id:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'utilisateur', 'type', 'titre', 'clicked_at']
    list_filter = ['type', 'clicked_at']
    search_fields = ['utilisateur__username', 'titre', 'contenu']
    readonly_fields = ['created_at']
