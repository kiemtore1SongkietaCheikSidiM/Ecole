"""Endpoints REST de l'application Alfarouk.

Les vues valident les donnees entrantes, appliquent les droits par role et
retournent des structures JSON stables pour le frontend.
"""

from datetime import datetime
import secrets
import string

from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_date

from .bulletin_scanner import scan_bulletin
from .models import Absence, Classe, Devoir, Eleve, EmploiDuTemps, Evenement, MATIERE_CHOICES, Message, NIVEAUX_SECONDAIRE, NIVEAU_CHOICES, Notification, Retard
from .timetable_scanner import scan_timetable

User = get_user_model()


def _is_admin(user):
    return user.role == 'ADMIN' or user.is_staff or user.is_superuser


def _authorized_message_recipients(user):
    """Retourne les contacts autorises selon le role et les classes de l'utilisateur."""
    admin_filter = Q(role='ADMIN') | Q(is_staff=True) | Q(is_superuser=True)
    if _is_admin(user):
        return User.objects.filter(is_active=True).exclude(pk=user.pk)

    if user.role == 'PARENT':
        class_names = Eleve.objects.filter(parent=user).values_list('classe', flat=True)
        teacher_filter = Q()
        for class_name in class_names:
            teacher_filter |= Q(classes__nom__iexact=class_name.strip())
        return User.objects.filter(
            admin_filter | (Q(role='ENSEIGNANT') & teacher_filter),
            is_active=True,
        ).exclude(pk=user.pk).distinct()

    if user.role == 'ENSEIGNANT':
        class_names = Classe.objects.filter(enseignant=user).values_list('nom', flat=True)
        parent_filter = Q()
        for class_name in class_names:
            parent_filter |= Q(enfants__classe__iexact=class_name.strip())
        return User.objects.filter(
            admin_filter | (Q(role='PARENT') & parent_filter),
            is_active=True,
        ).exclude(pk=user.pk).distinct()

    return User.objects.filter(admin_filter, is_active=True).exclude(pk=user.pk).distinct()


def _user_data(user):
    return {
        'id': user.id,
        'username': user.username,
        'nom': user.nom,
        'prenom': user.prenom,
        'email': user.email,
        'role': user.role,
    }


def _message_data(message, current_user):
    audio_url = message.media_url or ''
    if message.audio:
        audio_url = message.audio.url
    sender = _user_data(message.emetteur)
    recipient = _user_data(message.destinataire)
    return {
        'id': message.id,
        'contenu': message.contenu,
        'content': message.contenu,
        'message': message.contenu,
        'audio_url': audio_url or None,
        'voice_url': audio_url or None,
        'file': audio_url or None,
        'media': audio_url or None,
        'type': 'audio' if audio_url else 'text',
        'date_envoi': message.date_envoi,
        'created_at': message.date_envoi,
        'emetteur': sender,
        'destinataire': recipient,
        'sender': sender,
        'recipient': recipient,
        'sender_id': message.emetteur_id,
        'auteur_id': message.emetteur_id,
        'emetteur_id': message.emetteur_id,
        'destinataire_id': message.destinataire_id,
        'est_envoye': message.emetteur_id == current_user.id,
    }


def _create_notification(user, notification_type, title, content='', data=None):
    """Cree une notification persistante pour un seul utilisateur."""
    return Notification.objects.create(
        utilisateur=user,
        type=notification_type,
        titre=title,
        contenu=content,
        data=data or {},
    )


def _notify_student_parent(student, notification_type, title, content='', data=None):
    """Notifie le parent de l'eleve et envoie un email pour les types scolaires."""
    if student.parent_id:
        parent = student.parent
        _create_notification(parent, notification_type, title, content, data)
        if notification_type in {'ABSENCE', 'RETARD', 'DEVOIR'} and parent.email:
            send_mail(
                subject=title,
                message=(
                    f'Bonjour {parent.prenom or parent.username},\n\n'
                    f'{content}\n\n'
                    f'Élève : {student.prenom} {student.nom}\n'
                    f'Classe : {student.classe}\n\n'
                    'Connectez-vous à votre espace pour consulter les détails.'
                ),
                from_email=None,
                recipient_list=[parent.email],
                fail_silently=True,
            )


def _notification_data(notification):
    """Expose une notification avec les informations utiles au frontend."""
    category = 'MESSAGE' if notification.type == 'MESSAGE' else 'SCHOOL'
    notification_time = timezone.localtime(notification.created_at)
    student = None
    student_id = notification.data.get('eleve_id') if isinstance(notification.data, dict) else None
    if student_id:
        student = Eleve.objects.filter(pk=student_id).first()
    student_data = None
    if student:
        student_data = {
            'id': student.id,
            'nom': student.nom,
            'prenom': student.prenom,
            'classe': student.classe,
        }
    event_or_record_date = notification.data.get('date') if isinstance(notification.data, dict) else None
    sender = None
    sender_id = notification.data.get('emetteur_id') if isinstance(notification.data, dict) else None
    if sender_id:
        sender_user = User.objects.filter(pk=sender_id).first()
        if sender_user:
            sender = _user_data(sender_user)
    return {
        'id': notification.id,
        'type': notification.type,
        'category': category,
        'titre': notification.titre,
        'title': notification.titre,
        'contenu': notification.contenu,
        'content': notification.contenu,
        'data': notification.data,
        'created_at': notification.created_at,
        'clicked_at': notification.clicked_at,
        'is_clicked': notification.clicked_at is not None,
        'eleve': student_data,
        'nom_eleve': student.nom if student else None,
        'prenom_eleve': student.prenom if student else None,
        'auteur': sender,
        'date': event_or_record_date or notification_time.date().isoformat(),
        'heure': notification_time.strftime('%H:%M:%S'),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Inscrit un parent avec ses enfants ou un enseignant avec ses classes."""
    data = request.data
    username = data.get('username')
    nom = data.get('nom') or data.get('Nom')
    prenom = data.get('prenom') or data.get('Prenom')
    email = data.get('email')
    telephone = data.get('telephone') or data.get('tel')
    password = data.get('password')
    role = str(data.get('role', 'PARENT') or 'PARENT').upper()

    required_fields = [username, nom, prenom, email, password]
    if any(field in (None, '') for field in required_fields):
        return Response({'success': False, 'message': 'Tous les champs requis doivent être renseignés.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'success': False, 'message': 'Ce nom d’utilisateur existe déjà.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'success': False, 'message': 'Cet email est déjà utilisé.'}, status=status.HTTP_400_BAD_REQUEST)

    classes = data.get('classe', []) if role == 'ENSEIGNANT' else []
    eleves = data.get('eleve', []) if role == 'PARENT' else []
    if role not in {'PARENT', 'ENSEIGNANT'}:
        return Response({'success': False, 'message': 'Role invalide.'}, status=status.HTTP_400_BAD_REQUEST)
    if role == 'PARENT' and not eleves:
        return Response({'success': False, 'message': 'Un parent doit avoir au moins un eleve.'}, status=status.HTTP_400_BAD_REQUEST)
    if role == 'ENSEIGNANT':
        matieres = {item.get('matiere') or item.get('Matiere', '') for item in classes}
        if not 1 <= len(matieres) <= 3:
            return Response({'success': False, 'message': 'Un enseignant doit avoir entre 1 et 3 matieres distinctes.'}, status=status.HTTP_400_BAD_REQUEST)

    from .models import Classe, Eleve, NIVEAUX_SECONDAIRE
    try:
        with transaction.atomic():
            user = User.objects.create_user(username=username, email=email, password=password, nom=nom, prenom=prenom, telephone=telephone, role=role)
            if role == 'ENSEIGNANT':
                classes_par_niveau = {}
                for item in classes:
                    nom = item.get('classe') or item.get('Classe', '')
                    classes_par_niveau[nom] = classes_par_niveau.get(nom, 0) + 1
                    limite = 7 if nom in NIVEAUX_SECONDAIRE else 1
                    if classes_par_niveau[nom] > limite:
                        raise ValidationError({'classe': f'Une classe ne peut pas avoir plus de {limite} enseignant(s).'})
                    classe = Classe(nom=nom, matiere=item.get('matiere') or item.get('Matiere', ''), enseignant=user)
                    classe.full_clean()
                    classe.save()
            if role == 'PARENT':
                for item in eleves:
                    eleve = Eleve(nom=item.get('nom') or item.get('Nom', ''), prenom=item.get('prenom') or item.get('Prenom', ''), classe=item.get('classe') or item.get('Classe', ''), parent=user)
                    eleve.full_clean()
                    eleve.save()
    except ValidationError as error:
        return Response({'success': False, 'message': error.messages}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'success': True,
        'message': 'Utilisateur créé avec succès.',
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'nom': user.nom,
            'prenom': user.prenom,
            'email': user.email,
        },
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Authentifie un utilisateur et retourne les tokens JWT."""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'success': False, 'message': 'username et password sont requis.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(username=username).first()
    if user is None or not user.is_active or not user.check_password(password):
        return Response({'success': False, 'message': 'Identifiants invalides.'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    update_last_login(None, user)

    return Response({
        'success': True,
        'message': 'Connexion réussie.',
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        },
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'nom': user.nom,
            'prenom': user.prenom,
            'email': user.email,
            'is_admin': user.is_staff or user.is_superuser or user.role == 'ADMIN',
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        },
    }, status=status.HTTP_200_OK)


def _temporary_password():
    alphabet = string.ascii_letters + string.digits + '!@#$%'
    return ''.join(secrets.choice(alphabet) for _ in range(14))


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Send a temporary password to the email attached to a username."""
    username = str(request.data.get('username') or '').strip()
    if not username:
        return Response(
            {'success': False, 'message': 'Le username est requis.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(username__iexact=username, is_active=True).first()
    public_response = {
        'success': True,
        'message': 'Si ce compte existe, un mot de passe temporaire a été envoyé à son adresse email.',
    }
    if user is None:
        return Response(public_response, status=status.HTTP_200_OK)

    temporary_password = _temporary_password()
    try:
        send_mail(
            subject='Réinitialisation de votre mot de passe',
            message=(
                f'Bonjour {user.prenom or user.username},\n\n'
                'Une demande de réinitialisation a été effectuée pour votre compte.\n'
                f'Votre mot de passe temporaire est : {temporary_password}\n\n'
                'Connectez-vous avec ce mot de passe puis modifiez-le depuis votre profil.\n\n'
                'Si vous n êtes pas à l origine de cette demande, contactez l administration.'
            ),
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception:
        return Response(
            {'success': False, 'message': 'Le message email n’a pas pu être envoyé. Réessayez plus tard.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    user.set_password(temporary_password)
    user.save(update_fields=['password', 'updated_at'])
    return Response(public_response, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Retourne l'identite et les droits de l'utilisateur connecte."""
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'role': request.user.role,
        'nom': request.user.nom,
        'prenom': request.user.prenom,
        'email': request.user.email,
        'telephone': request.user.telephone,
        'is_admin': request.user.is_staff or request.user.is_superuser or request.user.role == 'ADMIN',
        'is_staff': request.user.is_staff,
        'is_superuser': request.user.is_superuser,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update the authenticated user's contact and identity information."""
    user = request.user
    fields = ('nom', 'prenom', 'email', 'telephone')
    updates = {}

    for field in fields:
        if field in request.data:
            value = str(request.data.get(field) or '').strip()
            if field in {'nom', 'prenom', 'email'} and not value:
                return Response(
                    {'success': False, 'message': f'Le champ {field} est requis.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            updates[field] = value

    email = updates.get('email')
    if email and User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
        return Response(
            {'success': False, 'message': 'Cet email est déjà utilisé.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    for field, value in updates.items():
        setattr(user, field, value)
    user.save(update_fields=[*updates.keys(), 'updated_at'])

    return Response({
        'success': True,
        'message': 'Profil mis à jour avec succès.',
        'user': {
            **_user_data(user),
            'telephone': user.telephone,
        },
    })


def _attendance_student(item, teacher):
    student_id = item.get('eleve_id') or item.get('student_id')
    student = None
    if student_id:
        try:
            student = Eleve.objects.get(pk=student_id)
        except (Eleve.DoesNotExist, TypeError, ValueError):
            return None
    else:
        student_name = str(item.get('nom') or '').strip()
        student_first_name = str(item.get('prenom') or '').strip()
        student_class = str(item.get('classe') or '').strip()
        if not student_name or not student_first_name or not student_class:
            return None
        student = Eleve.objects.filter(
            nom__iexact=student_name,
            prenom__iexact=student_first_name,
            classe__iexact=student_class,
        ).first()

    if student is None:
        return None
    teacher_classes = Classe.objects.filter(enseignant=teacher).values_list('nom', flat=True)
    if not any(student.classe.casefold() == class_name.casefold() for class_name in teacher_classes):
        return None
    return student


def _attendance_date(item):
    value = item.get('date') or item.get('jour')
    return parse_date(str(value)) if value else timezone.localdate()


def _attendance_data(record, include_minutes=False):
    data = {
        'id': record.id,
        'eleve_id': record.eleve_id,
        'eleve': {
            'nom': record.eleve.nom,
            'prenom': record.eleve.prenom,
            'classe': record.eleve.classe,
        },
        'date': record.date.isoformat(),
        'motif': record.motif,
    }
    if include_minutes:
        data['minutes'] = record.minutes
    return data


def _visible_student_filter(user, prefix=''):
    if _is_admin(user):
        return Q()
    if user.role == 'PARENT':
        return Q(**{f'{prefix}parent': user})
    if user.role == 'ENSEIGNANT':
        class_names = Classe.objects.filter(enseignant=user).values_list('nom', flat=True)
        student_filter = Q(pk__in=[])
        for class_name in class_names:
            student_filter |= Q(**{f'{prefix}classe__iexact': class_name})
        return student_filter
    return Q(pk__in=[])


def _attendance_history(model, user, include_minutes=False):
    records = model.objects.filter(_visible_student_filter(user, 'eleve__')).select_related('eleve', 'enseignant')
    return [_attendance_data(record, include_minutes=include_minutes) for record in records]


def _save_attendance(request, kind):
    """Enregistre une liste d'absences ou de retards envoyee par un enseignant."""
    if request.user.role != 'ENSEIGNANT':
        return Response(
            {'success': False, 'message': 'Acces reserve aux enseignants.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    field_name = 'absences' if kind == 'absence' else 'retards'
    items = request.data.get(field_name)
    if not isinstance(items, list) or not items:
        return Response(
            {'success': False, 'message': f'Le champ {field_name} doit contenir une liste non vide.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    records = []
    for item in items:
        if not isinstance(item, dict):
            return Response({'success': False, 'message': 'Chaque élément doit être un objet JSON.'}, status=status.HTTP_400_BAD_REQUEST)
        student = _attendance_student(item, request.user)
        date = _attendance_date(item)
        if student is None or date is None:
            return Response(
                {'success': False, 'message': 'Chaque élément doit identifier un élève de vos classes et une date valide.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        motif = str(item.get('motif') or item.get('raison') or '').strip()
        if kind == 'absence':
            record, created = Absence.objects.update_or_create(
                eleve=student,
                date=date,
                defaults={'enseignant': request.user, 'motif': motif},
            )
        else:
            raw_minutes = item.get('minutes', item.get('duree', item.get('duration')))
            try:
                minutes = int(raw_minutes)
            except (TypeError, ValueError):
                minutes = 0
            if minutes <= 0:
                return Response({'success': False, 'message': 'La durée du retard doit être supérieure à zéro minute.'}, status=status.HTTP_400_BAD_REQUEST)
            record, created = Retard.objects.update_or_create(
                eleve=student,
                date=date,
                defaults={'enseignant': request.user, 'minutes': minutes, 'motif': motif},
            )
        if created:
            notification_type = 'ABSENCE' if kind == 'absence' else 'RETARD'
            label = 'absence' if kind == 'absence' else 'retard'
            _notify_student_parent(
                student,
                notification_type,
                f'Nouvelle notification: {label}',
                f'{student.prenom} {student.nom} a une nouvelle saisie de {label} le {date.isoformat()}.',
                {'record_id': record.id, 'eleve_id': student.id, 'date': date.isoformat()},
            )
        records.append(_attendance_data(record, include_minutes=kind == 'retard'))

    return Response({'success': True, field_name: records, 'count': len(records)}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def create_absences(request):
    if request.method == 'GET':
        return Response({'results': _attendance_history(Absence, request.user)})
    return _save_attendance(request, 'absence')


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def create_retards(request):
    if request.method == 'GET':
        return Response({'results': _attendance_history(Retard, request.user, include_minutes=True)})
    return _save_attendance(request, 'retard')


def _devoir_data(record):
    notes = record.notes if isinstance(record.notes, list) else []
    return {
        'id': record.id,
        'eleve_id': record.eleve_id,
        'nom': record.eleve.nom,
        'prenom': record.eleve.prenom,
        'classe': record.eleve.classe,
        'date': record.date.isoformat(),
        'trimestre': record.trimestre,
        'matiere': record.matiere,
        'notes': notes,
        'note1': notes[0] if len(notes) > 0 else None,
        'note2': notes[1] if len(notes) > 1 else None,
        'composition': float(record.composition) if record.composition is not None else None,
        'nom_fichier': record.nom_fichier,
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def devoir_history(request):
    """Retourne uniquement les devoirs visibles par l'utilisateur courant."""
    records = Devoir.objects.filter(_visible_student_filter(request.user, 'eleve__')).select_related('eleve', 'enseignant')
    return Response({'results': [_devoir_data(record) for record in records]})


def _requested_trimester(value):
    try:
        trimester = int(value)
    except (TypeError, ValueError):
        return None
    return trimester if trimester in {1, 2, 3} else None


def _parent_grades_data(parent, trimester_filter=None):
    students = list(parent.enfants.all().order_by('nom', 'prenom'))
    grades = Devoir.objects.filter(eleve__parent=parent).select_related('eleve').order_by('date', 'id')
    grades_by_student = {}
    for grade in grades:
        grades_by_student.setdefault(grade.eleve_id, []).append(grade)

    students_data = []
    for student in students:
        terms = {}
        for trimester in (1, 2, 3):
            if trimester_filter and trimester != trimester_filter:
                continue
            subjects = {}
            trimester_grades = [
                grade for grade in grades_by_student.get(student.id, [])
                if grade.trimestre == trimester
            ]
            for grade in trimester_grades:
                subject = grade.matiere or 'NON_RENSEIGNEE'
                subject_data = subjects.setdefault(subject, {'notes': [], 'compositions': []})
                notes = grade.notes if isinstance(grade.notes, list) else []
                subject_data['notes'].extend(notes[:2])
                if grade.composition is not None:
                    subject_data['compositions'].append(float(grade.composition))
            terms[str(trimester)] = {
                'matieres': subjects,
                'devoirs': [_devoir_data(grade) for grade in trimester_grades],
            }
        students_data.append({
            'id': student.id,
            'nom': student.nom,
            'prenom': student.prenom,
            'classe': student.classe,
            'trimestres': terms,
        })
    return students_data


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_grades(request):
    """Return each parent's children and their grades grouped by trimester and subject."""
    if request.user.role == 'PARENT':
        parent = request.user
    elif _is_admin(request.user):
        parent_id = request.query_params.get('parent_id')
        if not parent_id:
            return Response({'success': False, 'message': 'Le parametre parent_id est requis.'}, status=status.HTTP_400_BAD_REQUEST)
        parent = User.objects.filter(pk=parent_id, role='PARENT').first()
        if parent is None:
            return Response({'success': False, 'message': 'Parent introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'success': False, 'message': 'Acces reserve aux parents.'}, status=status.HTTP_403_FORBIDDEN)

    raw_trimester = request.query_params.get('trimestre')
    trimester_filter = None
    if raw_trimester is not None:
        trimester_filter = _requested_trimester(raw_trimester)
        if trimester_filter is None:
            return Response({'success': False, 'message': 'Le trimestre doit être 1, 2 ou 3.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'success': True,
        'parent': _user_data(parent),
        'trimestre': trimester_filter,
        'eleves': _parent_grades_data(parent, trimester_filter),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_bulletins(request):
    """Return the bulletins belonging only to the authenticated parent's children."""
    if request.user.role != 'PARENT':
        return Response({'success': False, 'message': 'Acces reserve aux parents.'}, status=status.HTTP_403_FORBIDDEN)

    raw_trimester = request.query_params.get('trimestre')
    trimester_filter = None
    if raw_trimester is not None:
        trimester_filter = _requested_trimester(raw_trimester)
        if trimester_filter is None:
            return Response({'success': False, 'message': 'Le trimestre doit être 1, 2 ou 3.'}, status=status.HTTP_400_BAD_REQUEST)

    bulletins = _parent_grades_data(request.user, trimester_filter)
    return Response({
        'success': True,
        'parent': _user_data(request.user),
        'trimestre': trimester_filter,
        'bulletins': bulletins,
        'eleves': bulletins,
    })


def _uploaded_files(request):
    for field_name in ('fichier', 'file', 'devoir', 'devoirs', 'document', 'documents'):
        files = request.FILES.getlist(field_name)
        if files:
            return files
    return []


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scan_devoir_files(request):
    """Analyse des fichiers de devoir et persiste les resultats detectes."""
    if request.user.role != 'ENSEIGNANT' and not _is_admin(request.user):
        return Response({'success': False, 'message': 'Acces reserve aux enseignants.'}, status=status.HTTP_403_FORBIDDEN)

    uploaded_files = _uploaded_files(request)
    if not uploaded_files:
        return Response({'success': False, 'message': 'Ajoutez un ou plusieurs fichiers PDF dans le champ devoirs.'}, status=status.HTTP_400_BAD_REQUEST)

    requested_date = request.data.get('date') or timezone.localdate().isoformat()
    devoir_date = parse_date(str(requested_date))
    if devoir_date is None:
        return Response({'success': False, 'message': 'La date du devoir doit être au format YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

    trimester = _requested_trimester(request.data.get('trimestre', 1))
    if trimester is None:
        return Response({'success': False, 'message': 'Le trimestre doit être 1, 2 ou 3.'}, status=status.HTTP_400_BAD_REQUEST)

    results = []
    for uploaded_file in uploaded_files:
        try:
            result = scan_bulletin(uploaded_file)
        except ImportError:
            return Response({'success': False, 'message': 'Le scanner PDF est indisponible. Installez les dependances de requirements.txt.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except ValueError as error:
            return Response({'success': False, 'fichier': uploaded_file.name, 'message': str(error)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        student_data = result['eleve']
        student = Eleve.objects.filter(
            nom__iexact=student_data.get('nom') or '',
            prenom__iexact=student_data.get('prenom') or '',
            classe__iexact=student_data.get('classe') or '',
        ).first()
        if student is None:
            return Response({'success': False, 'fichier': uploaded_file.name, 'message': 'Élève introuvable dans cette classe.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        if request.user.role == 'ENSEIGNANT' and not Eleve.objects.filter(_visible_student_filter(request.user), pk=student.pk).exists():
            return Response({'success': False, 'fichier': uploaded_file.name, 'message': 'Cet élève n’appartient pas à vos classes.'}, status=status.HTTP_403_FORBIDDEN)

        notes = result.get('notes') or []
        matiere = str(request.data.get('matiere') or (notes[0].get('matiere') if notes else '')).strip()
        record = Devoir.objects.filter(eleve=student, date=devoir_date, matiere=matiere).first()
        if record is None:
            record = Devoir.objects.create(
                eleve=student,
                enseignant=request.user if request.user.role == 'ENSEIGNANT' else None,
                date=devoir_date,
                trimestre=trimester,
                matiere=matiere,
                notes=notes,
                composition=result.get('composition'),
                nom_fichier=uploaded_file.name,
            )
            _notify_student_parent(
                student,
                'DEVOIR',
                'Nouveau devoir disponible',
                f'Un nouveau devoir de {student.prenom} {student.nom} est disponible.',
                {'record_id': record.id, 'eleve_id': student.id, 'date': devoir_date.isoformat()},
            )
        else:
            record.enseignant = request.user if request.user.role == 'ENSEIGNANT' else record.enseignant
            record.trimestre = trimester
            record.notes = notes
            record.composition = result.get('composition')
            record.nom_fichier = uploaded_file.name
            record.save(update_fields=['enseignant', 'trimestre', 'notes', 'composition', 'nom_fichier'])
        results.append(_devoir_data(record))

    return Response({'success': True, 'results': results, 'devoirs': results}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parents_with_students(request):
    """Return parent profiles with their students for parents and administrators."""
    if request.user.role not in {'PARENT', 'ADMIN'} and not request.user.is_staff and not request.user.is_superuser:
        return Response({'success': False, 'message': 'Acces reserve aux parents et aux administrateurs.'}, status=status.HTTP_403_FORBIDDEN)

    parents = User.objects.filter(role='PARENT') if request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser else User.objects.filter(pk=request.user.pk)
    parents = parents.prefetch_related('enfants')
    result = []
    for parent in parents:
        result.append({
            'id': parent.id,
            'username': parent.username,
            'nom': parent.nom,
            'prenom': parent.prenom,
            'email': parent.email,
            'telephone': parent.telephone,
            'role': parent.role,
            'eleves': [
                {
                    'id': eleve.id,
                    'nom': eleve.nom,
                    'prenom': eleve.prenom,
                    'classe': eleve.classe,
                    'created_at': eleve.created_at,
                }
                for eleve in parent.enfants.all()
            ],
        })

    return Response({'success': True, 'parents': result})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_students(request):
    """Return all students belonging to the classes assigned to a teacher."""
    if request.user.role != 'ENSEIGNANT':
        return Response({'success': False, 'message': 'Acces reserve aux enseignants.'}, status=status.HTTP_403_FORBIDDEN)

    classes = list(Classe.objects.filter(enseignant=request.user).values('id', 'nom', 'matiere'))
    class_names = {classe['nom'].strip() for classe in classes}
    class_filter = Q()
    for class_name in class_names:
        class_filter |= Q(classe__iexact=class_name)
    students = Eleve.objects.filter(class_filter).order_by('classe', 'nom', 'prenom')

    return Response({
        'success': True,
        'classes': classes,
        'eleves': [
            {
                'id': student.id,
                'nom': student.nom,
                'prenom': student.prenom,
                'classe': student.classe,
                'parent_id': student.parent_id,
            }
            for student in students
        ],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_classes(request):
    """Return the classes and subjects assigned to a teacher."""
    if request.user.role != 'ENSEIGNANT':
        return Response({'success': False, 'message': 'Acces reserve aux enseignants.'}, status=status.HTTP_403_FORBIDDEN)

    classes = Classe.objects.filter(enseignant=request.user).order_by('nom', 'matiere')

    return Response({
        'success': True,
        'classes': [
            {
                'id': classe.id,
                'nom': classe.nom,
                'matiere': classe.matiere,
            }
            for classe in classes
        ],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def class_list(request, classe=None):
    """Return students belonging to a class, optionally filtered by class level."""
    class_name = classe or request.query_params.get('classe')
    queryset = Eleve.objects.select_related('parent').order_by('nom', 'prenom')
    if class_name:
        queryset = queryset.filter(classe__iexact=class_name.strip())

    return Response({
        'success': True,
        'classe': class_name,
        'eleves': [
            {
                'id': item.id,
                'nom': item.nom,
                'prenom': item.prenom,
                'classe': item.classe,
                'parent_id': item.parent_id,
            }
            for item in queryset
        ],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def class_timetable(request, classe):
    """Return the timetable entries for a class level."""
    class_queryset = Classe.objects.filter(nom__iexact=classe).select_related('enseignant')
    if not class_queryset.exists():
        return Response({'success': False, 'message': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    allowed_classes = _timetable_classes_for_user(request.user)
    if not _is_admin(request.user) and not class_queryset.filter(_class_name_filter(allowed_classes)).exists():
        return Response({'success': False, 'message': 'Acces refuse pour cette classe.'}, status=status.HTTP_403_FORBIDDEN)

    entries = EmploiDuTemps.objects.filter(classe__in=class_queryset).select_related('classe', 'classe__enseignant')
    day_order = {day: index for index, (day, _) in enumerate(EmploiDuTemps.JOUR_CHOICES)}
    entries = sorted(entries, key=lambda entry: (day_order[entry.jour], entry.heure_debut))
    return Response({
        'success': True,
        'classe': classe,
        'emploi_du_temps': [
            {
                'id': entry.id,
                'jour': entry.jour,
                'jour_label': entry.get_jour_display(),
                'heure_debut': entry.heure_debut.strftime('%H:%M'),
                'heure_fin': entry.heure_fin.strftime('%H:%M'),
                'salle': entry.salle,
                'matiere': entry.classe.matiere,
                'enseignant': _user_data(entry.classe.enseignant) if entry.classe.enseignant else None,
            }
            for entry in entries
        ],
    })


def _timetable_classes_for_user(user):
    if _is_admin(user):
        return set(Classe.objects.values_list('nom', flat=True))
    if user.role == 'PARENT':
        return set(Eleve.objects.filter(parent=user).values_list('classe', flat=True))
    if user.role == 'ENSEIGNANT':
        return set(Classe.objects.filter(enseignant=user).values_list('nom', flat=True))
    return set()


def _class_name_filter(class_names, field='nom'):
    class_filter = Q(pk__in=[])
    for class_name in class_names:
        class_filter |= Q(**{f'{field}__iexact': str(class_name).strip()})
    return class_filter


def _timetable_entry_data(entry):
    return {
        'id': entry.id,
        'classe': entry.classe.nom,
        'jour': entry.jour,
        'jour_label': entry.get_jour_display(),
        'heure_debut': entry.heure_debut.strftime('%H:%M'),
        'heure_fin': entry.heure_fin.strftime('%H:%M'),
        'salle': entry.salle,
        'matiere': entry.classe.matiere,
        'enseignant': _user_data(entry.classe.enseignant) if entry.classe.enseignant else None,
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def timetables(request):
    """Return only the timetables visible to the authenticated user."""
    allowed_classes = _timetable_classes_for_user(request.user)
    entries = EmploiDuTemps.objects.filter(_class_name_filter(allowed_classes, 'classe__nom')).select_related('classe', 'classe__enseignant')
    return Response({
        'success': True,
        'classes': sorted(allowed_classes, key=str.casefold),
        'emplois_du_temps': [_timetable_entry_data(entry) for entry in entries],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_timetables(request):
    """Explicit parent route for the timetables of the authenticated parent's children."""
    if request.user.role != 'PARENT':
        return Response({'success': False, 'message': 'Acces reserve aux parents.'}, status=status.HTTP_403_FORBIDDEN)
    allowed_classes = _timetable_classes_for_user(request.user)
    entries = EmploiDuTemps.objects.filter(
        _class_name_filter(allowed_classes, 'classe__nom'),
    ).select_related('classe', 'classe__enseignant')
    return Response({
        'success': True,
        'classes': sorted(allowed_classes, key=str.casefold),
        'emplois_du_temps': [_timetable_entry_data(entry) for entry in entries],
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scan_timetable_files(request):
    """Scan one or more timetable PDFs and create their detected entries."""
    if not _is_admin(request.user):
        return Response({'success': False, 'message': 'Acces reserve aux administrateurs.'}, status=status.HTTP_403_FORBIDDEN)

    uploaded_files = []
    for field_name in ('fichier', 'file', 'emploi_du_temps', 'emplois_du_temps'):
        uploaded_files = request.FILES.getlist(field_name)
        if uploaded_files:
            break
    if not uploaded_files:
        return Response({'success': False, 'message': 'Ajoutez un ou plusieurs fichiers PDF dans le champ emploi_du_temps.'}, status=status.HTTP_400_BAD_REQUEST)

    scanned_files = []
    created_entries = []
    for uploaded_file in uploaded_files:
        try:
            result = scan_timetable(uploaded_file)
        except ImportError:
            return Response({'success': False, 'message': 'Le scanner PDF est indisponible. Installez les dependances de requirements.txt.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except ValueError as error:
            return Response({'success': False, 'fichier': uploaded_file.name, 'message': str(error)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        file_entries = []
        for item in result['creneaux']:
            classe = Classe.objects.filter(nom=item['classe'], matiere=item['matiere']).first()
            if classe is None:
                classe = Classe.objects.create(nom=item['classe'], matiere=item['matiere'])
            heure_debut = datetime.strptime(item['heure_debut'], '%H:%M').time()
            heure_fin = datetime.strptime(item['heure_fin'], '%H:%M').time()
            entry, created = EmploiDuTemps.objects.get_or_create(
                classe=classe,
                jour=item['jour'],
                heure_debut=heure_debut,
                defaults={'heure_fin': heure_fin, 'salle': item['salle']},
            )
            if not created and (entry.heure_fin != heure_fin or entry.salle != item['salle']):
                entry.heure_fin = heure_fin
                entry.salle = item['salle']
                entry.save(update_fields=['heure_fin', 'salle'])
            file_entries.append(_timetable_entry_data(entry))
            created_entries.append(entry)
        scanned_files.append({
            'nom_fichier': result['nom_fichier'],
            'pages': result['pages'],
            'classes': result['classes'],
            'creneaux': file_entries,
        })

    return Response({
        'success': True,
        'fichiers': scanned_files,
        'emplois_du_temps': [_timetable_entry_data(entry) for entry in created_entries],
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def scan_class(request):
    """Find classes from a value read by a QR/barcode/OCR scanner."""
    query = request.query_params.get('q') if request.method == 'GET' else request.data.get('q')
    query = query or (request.data.get('code') if request.method == 'POST' else None)
    query = query or (request.data.get('classe') if request.method == 'POST' else None)
    query = str(query or '').strip()
    if not query:
        return Response({'success': False, 'message': 'Le code ou le nom de la classe est requis.'}, status=status.HTTP_400_BAD_REQUEST)

    class_names = set(Classe.objects.filter(nom__icontains=query).values_list('nom', flat=True))
    class_names.update(Eleve.objects.filter(classe__icontains=query).values_list('classe', flat=True))
    canonical_names = {}
    for class_name in class_names:
        class_record = Classe.objects.filter(nom__iexact=class_name).first()
        canonical_name = class_record.nom if class_record else class_name
        canonical_names[canonical_name.casefold()] = canonical_name

    classes = []
    for class_name in sorted(canonical_names.values(), key=str.casefold):
        class_records = Classe.objects.filter(nom__iexact=class_name).select_related('enseignant')
        classes.append({
            'nom': class_name,
            'matieres': list(class_records.values_list('matiere', flat=True).distinct()),
            'eleves_count': Eleve.objects.filter(classe__iexact=class_name).count(),
            'emploi_du_temps_url': f'/api/classes/{class_name}/emploi-du-temps/',
        })

    return Response({'success': True, 'recherche': query, 'classes': classes})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    """Return all parents, teachers, and students for administrators."""
    if request.user.role != 'ADMIN' and not request.user.is_staff and not request.user.is_superuser:
        return Response({'success': False, 'message': 'Acces reserve aux administrateurs.'}, status=status.HTTP_403_FORBIDDEN)

    users = User.objects.all().order_by('role', 'nom', 'prenom')
    parents = [user for user in users if user.role == 'PARENT']
    teachers = [user for user in users if user.role == 'ENSEIGNANT']
    students = Eleve.objects.select_related('parent').order_by('classe', 'nom', 'prenom')

    return Response({
        'success': True,
        'parents': [
            {
                'id': parent.id,
                'username': parent.username,
                'nom': parent.nom,
                'prenom': parent.prenom,
                'email': parent.email,
                'telephone': parent.telephone,
            }
            for parent in parents
        ],
        'enseignants': [
            {
                'id': teacher.id,
                'username': teacher.username,
                'nom': teacher.nom,
                'prenom': teacher.prenom,
                'email': teacher.email,
                'telephone': teacher.telephone,
                'classes': list(teacher.classes.values('id', 'nom', 'matiere')),
            }
            for teacher in teachers
        ],
        'eleves': [
            {
                'id': student.id,
                'nom': student.nom,
                'prenom': student.prenom,
                'classe': student.classe,
                'parent_id': student.parent_id,
                'parent': student.parent.get_full_name() if student.parent else None,
            }
            for student in students
        ],
    })


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def class_options(request):
    """Return the class levels and subjects available to registration forms."""
    niveaux = [
        {'value': value, 'label': label}
        for value, label in NIVEAU_CHOICES
    ]
    matieres = [
        {'value': value, 'label': label}
        for value, label in MATIERE_CHOICES
    ]

    return Response({
        'classes': niveaux,
        'matieres': matieres,
        'regles': {
            'primaire_maternelle': {
                'classes': [
                    {'value': value, 'label': label}
                    for value, label in NIVEAU_CHOICES
                    if value not in NIVEAUX_SECONDAIRE
                ],
                'matieres': [{'value': 'FRANCAIS', 'label': 'Francais'}],
            },
            'secondaire': {
                'classes': [
                    {'value': value, 'label': label}
                    for value, label in NIVEAU_CHOICES
                    if value in NIVEAUX_SECONDAIRE
                ],
                'matieres': matieres,
            },
        },
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def message_contacts(request):
    """Return only the users the authenticated user is allowed to contact."""
    contacts = _authorized_message_recipients(request.user).order_by('role', 'nom', 'prenom')
    return Response({'success': True, 'contacts': [_user_data(user) for user in contacts]})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def messages(request):
    """Liste les messages ou cree un message vers un contact autorise."""
    if request.method == 'GET':
        queryset = Message.objects.filter(
            Q(emetteur=request.user) | Q(destinataire=request.user)
        ).select_related('emetteur', 'destinataire')
        return Response({
            'success': True,
            'messages': [_message_data(message, request.user) for message in queryset],
        })

    recipient_id = request.data.get('destinataire_id')
    contenu = str(request.data.get('contenu') or request.data.get('content') or request.data.get('message') or '').strip()
    uploaded_audio = next((request.FILES.get(name) for name in ('audio', 'voice', 'file', 'media') if request.FILES.get(name)), None)
    media_url = str(
        request.data.get('audio_url') or request.data.get('voice_url') or
        request.data.get('file') or request.data.get('media') or ''
    ).strip()
    if not recipient_id or (not contenu and not uploaded_audio and not media_url):
        return Response(
            {'success': False, 'message': 'destinataire_id et contenu ou fichier audio sont requis.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        recipient = _authorized_message_recipients(request.user).get(pk=recipient_id)
    except (TypeError, ValueError, User.DoesNotExist):
        recipient = None
    if recipient is None:
        return Response(
            {'success': False, 'message': 'Ce destinataire ne peut pas etre contacte.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    message = Message.objects.create(
        contenu=contenu,
        audio=uploaded_audio,
        media_url='' if uploaded_audio else media_url,
        emetteur=request.user,
        destinataire=recipient,
    )
    _create_notification(
        recipient,
        'MESSAGE',
        f'Nouveau message de {request.user.prenom or request.user.username}',
        contenu or 'Vous avez reçu un fichier audio.',
        {'message_id': message.id, 'emetteur_id': request.user.id},
    )
    return Response(
        {'success': True, 'message': _message_data(message, request.user)},
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def message_conversation(request, interlocuteur_id):
    """Return the complete conversation with one authorized interlocutor."""
    try:
        interlocuteur = _authorized_message_recipients(request.user).get(pk=interlocuteur_id)
    except (TypeError, ValueError, User.DoesNotExist):
        interlocuteur = None

    if interlocuteur is None:
        return Response(
            {'success': False, 'message': 'Cet interlocuteur ne peut pas etre contacte.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    queryset = Message.objects.filter(
        Q(emetteur=request.user, destinataire=interlocuteur)
        | Q(emetteur=interlocuteur, destinataire=request.user)
    ).select_related('emetteur', 'destinataire').order_by('date_envoi', 'id')

    return Response({
        'success': True,
        'interlocuteur': _user_data(interlocuteur),
        'messages': [_message_data(message, request.user) for message in queryset],
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scan_bulletin_pdf(request):
    """Extract student identity and grades from one or more bulletin PDFs."""
    uploaded_files = []
    for field_name in ('fichier', 'file', 'bulletin', 'bulletins'):
        uploaded_files = request.FILES.getlist(field_name)
        if uploaded_files:
            break

    if not uploaded_files:
        return Response(
            {
                'success': False,
                'message': 'Le champ fichier est requis. Utilisez formData.append("bulletins", pdfFile).',
                'champs_fichiers_recus': list(request.FILES.keys()),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    results = []
    for uploaded_file in uploaded_files:
        try:
            result = scan_bulletin(uploaded_file)
        except ImportError:
            return Response(
                {'success': False, 'message': 'Le scanner PDF est indisponible. Installez les dependances de requirements.txt.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except ValueError as error:
            return Response(
                {'success': False, 'fichier': uploaded_file.name, 'message': str(error)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        except Exception:
            return Response(
                {'success': False, 'fichier': uploaded_file.name, 'message': 'Le PDF est invalide ou ne peut pas être lu.'},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        student_data = result['eleve']
        existing_student = Eleve.objects.filter(
            nom__iexact=student_data.get('nom') or '',
            prenom__iexact=student_data.get('prenom') or '',
            classe__iexact=student_data.get('classe') or '',
        ).first()
        result['eleve_id'] = existing_student.id if existing_student else None
        results.append(result)

    response_data = {'success': True, 'bulletins': results}
    if len(results) == 1:
        response_data['bulletin'] = results[0]
    return Response(response_data, status=status.HTTP_200_OK)


def _is_admin_request(user):
    return user.role == 'ADMIN' or user.is_staff or user.is_superuser


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def evenements(request):
    """Liste les evenements ou cree une annonce en tant qu'administrateur."""
    if request.method == 'GET':
        events = Evenement.objects.all()
        return Response({'success': True, 'evenements': [
            {
                'id': event.id,
                'date': event.date.isoformat(),
                'titre': event.titre,
                'contenu': event.contenu,
                'created_at': event.created_at,
            }
            for event in events
        ]})

    if not _is_admin_request(request.user):
        return Response({'success': False, 'message': 'Acces reserve aux administrateurs.'}, status=status.HTTP_403_FORBIDDEN)
    title = str(request.data.get('titre') or request.data.get('title') or '').strip()
    content = str(request.data.get('contenu') or request.data.get('content') or '').strip()
    event_date = parse_date(str(request.data.get('date') or ''))
    if not title or not content or event_date is None:
        return Response({'success': False, 'message': 'La date, le titre et le contenu sont requis.'}, status=status.HTTP_400_BAD_REQUEST)

    event = Evenement.objects.create(date=event_date, titre=title, contenu=content, created_by=request.user)
    return Response({'success': True, 'evenement': {
        'id': event.id,
        'date': event.date.isoformat(),
        'titre': event.titre,
        'contenu': event.contenu,
    }}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications(request):
    """Retourne les notifications, les categories et les compteurs non lus."""
    queryset = Notification.objects.filter(utilisateur=request.user)
    requested_type = str(request.query_params.get('type') or '').upper()
    if requested_type in {'ABSENCE', 'RETARD', 'DEVOIR', 'EVENEMENT', 'MESSAGE'}:
        queryset = queryset.filter(type=requested_type)
    school_queryset = Notification.objects.filter(utilisateur=request.user).exclude(type='MESSAGE')
    message_queryset = Notification.objects.filter(utilisateur=request.user, type='MESSAGE')
    unread_count = queryset.filter(clicked_at__isnull=True).count()
    school_count = school_queryset.filter(clicked_at__isnull=True).count()
    message_count = message_queryset.filter(clicked_at__isnull=True).count()
    school_notifications = queryset.exclude(type='MESSAGE')
    message_notifications = queryset.filter(type='MESSAGE')
    return Response({
        'success': True,
        'count': unread_count,
        'unread_count': unread_count,
        'school_count': school_count,
        'message_count': message_count,
        'notifications': [_notification_data(item) for item in queryset],
        'school_notifications': [_notification_data(item) for item in school_notifications],
        'message_notifications': [_notification_data(item) for item in message_notifications],
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def click_notification(request, notification_id):
    """Marque une notification appartenant a l'utilisateur courant comme lue."""
    notification = Notification.objects.filter(pk=notification_id, utilisateur=request.user).first()
    if notification is None:
        return Response({'success': False, 'message': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if notification.clicked_at is None:
        notification.clicked_at = timezone.now()
        notification.save(update_fields=['clicked_at'])
    user_notifications = Notification.objects.filter(utilisateur=request.user)
    unread_count = user_notifications.filter(clicked_at__isnull=True).count()
    school_count = user_notifications.exclude(type='MESSAGE').filter(clicked_at__isnull=True).count()
    message_count = user_notifications.filter(type='MESSAGE', clicked_at__isnull=True).count()
    return Response({
        'success': True,
        'count': unread_count,
        'unread_count': unread_count,
        'school_count': school_count,
        'message_count': message_count,
        'notification': _notification_data(notification),
    })
