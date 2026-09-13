"""Modele de donnees principal de l'application scolaire.

Les relations de ce module servent aussi a appliquer les regles de visibilite:
un parent voit ses enfants, un enseignant voit ses classes et l'administration
voit l'ensemble des donnees.
"""

from django.contrib.auth.models import AbstractUser, UserManager
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


NIVEAU_CHOICES = [
    ('CP1', 'CP1'),
    ('CP2', 'CP2'),
    ('CE1', 'CE1'),
    ('CE2', 'CE2'),
    ('CM1', 'CM1'),
    ('CM2', 'CM2'),
    ('GS', 'Grande Section'),
    ('MS', 'Moyenne Section'),
    ('PS', 'Petite Section'),
    ('6EME', '6eme'),
    ('5EME', '5eme'),
    ('4EME', '4eme'),
    ('3EME', '3eme'),
    ('2NDEC', '2ndeC'),
    ('1ERED', '1ereD'),
    ('TLED', 'TleD'),
]

MATIERE_CHOICES = [
    ('FRANCAIS', 'Francais'),
    ('ANGLAIS', 'Anglais'),
    ('HISTOIRE_GEOGRAPHIE', 'Histoire-geographie'),
    ('MATHEMATIQUE', 'Mathematique'),
    ('EPS', 'EPS'),
    ('PHYSIQUE_CHIMIE', 'Physique-Chimie'),
    ('ALLEMAND', 'Allemand'),
]

NIVEAUX_SECONDAIRE = {'6EME', '5EME', '4EME', '3EME', '2NDEC', '1ERED', 'TLED'}


class Utilisateur(AbstractUser):
    """Compte applicatif portant le role parent, enseignant ou administrateur."""
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('ENSEIGNANT', 'Enseignant'),
        ('PARENT', 'Parent'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='PARENT')
    nom = models.CharField(max_length=150, blank=True)
    prenom = models.CharField(max_length=150, blank=True)
    email = models.EmailField(unique=True, blank=False)
    telephone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'nom', 'prenom']
    objects = UserManager()

    def save(self, *args, **kwargs):
        if self.is_superuser or self.is_staff:
            self.role = 'ADMIN'
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'utilisateur'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def __str__(self):
        return f"{self.username} ({self.role})"


class Eleve(models.Model):
    """Eleve rattache a une classe textuelle et, si possible, a un parent."""
    nom = models.CharField(max_length=150)
    prenom = models.CharField(max_length=150)
    classe = models.CharField(max_length=150)
    parent = models.ForeignKey('Utilisateur', on_delete=models.CASCADE, related_name='enfants', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'eleve'

    def __str__(self):
        return f"{self.nom} {self.prenom}"

    def clean(self):
        if self.parent_id and self.parent.role != 'PARENT':
            raise ValidationError({'parent': 'Un eleve doit etre rattache a un parent.'})


class Classe(models.Model):
    """Classe et matiere affectees a un enseignant."""
    nom = models.CharField(max_length=150, choices=NIVEAU_CHOICES)
    matiere = models.CharField(max_length=150, choices=MATIERE_CHOICES)
    enseignant = models.ForeignKey('Utilisateur', on_delete=models.SET_NULL, related_name='classes', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'classe'
        constraints = [
            models.UniqueConstraint(fields=['nom', 'enseignant'], name='classe_enseignant_unique'),
        ]

    def __str__(self):
        return f"{self.nom} - {self.matiere}"

    def clean(self):
        if self.nom not in NIVEAUX_SECONDAIRE and self.matiere not in {'FRANCAIS'}:
            raise ValidationError({'matiere': 'Les classes du primaire et de la maternelle utilisent une affectation generale.'})
        if self.enseignant_id:
            if self.enseignant.role != 'ENSEIGNANT':
                raise ValidationError({'enseignant': 'Seul un enseignant peut etre affecte a une classe.'})
            enseignants_de_la_classe = Classe.objects.filter(nom=self.nom).exclude(pk=self.pk)
            limite = 7 if self.nom in NIVEAUX_SECONDAIRE else 1
            if enseignants_de_la_classe.count() >= limite:
                type_classe = 'secondaire' if self.nom in NIVEAUX_SECONDAIRE else 'primaire ou maternelle'
                raise ValidationError({'nom': f'Une classe {type_classe} ne peut pas avoir plus de {limite} enseignant(s).'})


class EmploiDuTemps(models.Model):
    """Creneau d'emploi du temps rattache a une classe."""
    JOUR_CHOICES = [
        ('LUNDI', 'Lundi'),
        ('MARDI', 'Mardi'),
        ('MERCREDI', 'Mercredi'),
        ('JEUDI', 'Jeudi'),
        ('VENDREDI', 'Vendredi'),
        ('SAMEDI', 'Samedi'),
    ]

    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name='emplois_du_temps')
    jour = models.CharField(max_length=10, choices=JOUR_CHOICES)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    salle = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'emploi_du_temps'
        ordering = ['jour', 'heure_debut']
        constraints = [
            models.UniqueConstraint(
                fields=['classe', 'jour', 'heure_debut'],
                name='emploi_classe_jour_debut_unique',
            ),
        ]

    def clean(self):
        if self.heure_debut and self.heure_fin and self.heure_debut >= self.heure_fin:
            raise ValidationError({'heure_fin': "L'heure de fin doit être postérieure à l'heure de début."})

    def __str__(self):
        return f'{self.classe.nom} - {self.jour} {self.heure_debut}'


class Absence(models.Model):
    """Absence saisie par un enseignant pour un eleve et une date."""
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name='absences')
    enseignant = models.ForeignKey('Utilisateur', on_delete=models.SET_NULL, null=True, related_name='absences_saisies')
    date = models.DateField()
    motif = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'absence'
        ordering = ['-date', 'eleve__nom', 'eleve__prenom']
        constraints = [
            models.UniqueConstraint(fields=['eleve', 'date'], name='absence_eleve_date_unique'),
        ]

    def __str__(self):
        return f'{self.eleve} - absence du {self.date}'


class Retard(models.Model):
    """Retard saisie par un enseignant avec une duree en minutes."""
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name='retards')
    enseignant = models.ForeignKey('Utilisateur', on_delete=models.SET_NULL, null=True, related_name='retards_saisis')
    date = models.DateField()
    minutes = models.PositiveIntegerField(default=0)
    motif = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'retard'
        ordering = ['-date', 'eleve__nom', 'eleve__prenom']
        constraints = [
            models.UniqueConstraint(fields=['eleve', 'date'], name='retard_eleve_date_unique'),
        ]

    def __str__(self):
        return f'{self.eleve} - retard du {self.date}'


class Devoir(models.Model):
    """Resultat de devoir ou de bulletin importe depuis un document."""
    TRIMESTRE_CHOICES = [
        (1, 'Trimestre 1'),
        (2, 'Trimestre 2'),
        (3, 'Trimestre 3'),
    ]

    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name='devoirs')
    enseignant = models.ForeignKey('Utilisateur', on_delete=models.SET_NULL, null=True, related_name='devoirs_scannes')
    date = models.DateField()
    trimestre = models.PositiveSmallIntegerField(choices=TRIMESTRE_CHOICES, default=1)
    matiere = models.CharField(max_length=150, blank=True)
    notes = models.JSONField(default=list)
    composition = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    nom_fichier = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'devoir'
        ordering = ['-date', 'eleve__nom', 'eleve__prenom']

    def __str__(self):
        return f'{self.eleve} - devoir du {self.date}'


class Message(models.Model):
    """Message texte ou audio echange entre deux utilisateurs autorises."""
    contenu = models.TextField(blank=True)
    audio = models.FileField(upload_to='messages/audio/', blank=True, null=True)
    media_url = models.URLField(blank=True)
    emetteur = models.ForeignKey('Utilisateur', on_delete=models.CASCADE, related_name='messages_envoyes')
    destinataire = models.ForeignKey('Utilisateur', on_delete=models.CASCADE, related_name='messages_recus')
    date_envoi = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'message'
        ordering = ['-date_envoi']

    def __str__(self):
        return f'{self.emetteur} -> {self.destinataire}'


class Evenement(models.Model):
    """Annonce de l'administration visible par les utilisateurs actifs."""
    date = models.DateField()
    titre = models.CharField(max_length=255)
    contenu = models.TextField()
    created_by = models.ForeignKey('Utilisateur', on_delete=models.SET_NULL, null=True, related_name='evenements_crees')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'evenement'
        ordering = ['date', 'id']

    def __str__(self):
        return f'{self.titre} - {self.date}'


class Notification(models.Model):
    """Notification personnelle, lue lorsque l'utilisateur clique dessus."""
    TYPE_CHOICES = [
        ('ABSENCE', 'Absence'),
        ('RETARD', 'Retard'),
        ('DEVOIR', 'Devoir'),
        ('BULLETIN', 'Bulletin'),
        ('EVENEMENT', 'Evenement'),
        ('MESSAGE', 'Message'),
    ]

    utilisateur = models.ForeignKey('Utilisateur', on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    titre = models.CharField(max_length=255)
    contenu = models.TextField(blank=True)
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    clicked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'notification'
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f'{self.utilisateur} - {self.titre}'


@receiver(post_save, sender=Evenement)
def notify_users_of_event(sender, instance, created, **kwargs):
    """Diffuse un evenement nouvellement cree et son email associe."""
    if not created:
        return
    for user in Utilisateur.objects.filter(is_active=True):
        Notification.objects.create(
            utilisateur=user,
            type='EVENEMENT',
            titre=instance.titre,
            contenu=instance.contenu,
            data={'evenement_id': instance.id, 'date': instance.date.isoformat()},
        )
        if user.email:
            send_mail(
                subject=instance.titre,
                message=(
                    f'Bonjour {user.prenom or user.username},\n\n'
                    f'{instance.contenu}\n\n'
                    f'Date de l evenement : {instance.date.isoformat()}\n\n'
                    'Connectez-vous à votre espace pour consulter les détails.'
                ),
                from_email=None,
                recipient_list=[user.email],
                fail_silently=True,
            )
