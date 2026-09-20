from django.conf import settings
from django.core import mail
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.test import override_settings
from unittest.mock import patch
from rest_framework.test import APIClient

from .models import Absence, Classe, Devoir, Eleve, EmploiDuTemps, Message, Notification, Retard


class ProjectSettingsTests(TestCase):
    def test_react_cors_origin_is_configured(self):
        self.assertIn('http://localhost:5173', settings.CORS_ALLOWED_ORIGINS)

    def test_postgresql_database_is_configured(self):
        db = settings.DATABASES['default']
        self.assertEqual(db['ENGINE'], 'django.db.backends.postgresql')
        self.assertIn('postgres', db['NAME'])
        self.assertEqual(db['USER'], 'postgres')
        self.assertEqual(db['HOST'], 'localhost')
        self.assertEqual(db['PORT'], '5432')


class UserAuthenticationTests(TestCase):
    def test_custom_user_model_exists_and_supports_roles(self):
        user_model = get_user_model()
        self.assertEqual(user_model._meta.model_name, 'utilisateur')
        self.assertTrue(hasattr(user_model, 'role'))

    def test_login_endpoint_requires_username_and_password(self):
        user_model = get_user_model()
        user = user_model.objects.create_user(
            username='teacher01',
            password='SecretPass123',
            role='ENSEIGNANT',
            nom='Ali',
            prenom='Bensaid',
            email='teacher@example.com',
            telephone='0600000000',
        )
        self.assertTrue(user.check_password('SecretPass123'))
        self.assertEqual(user.role, 'ENSEIGNANT')

    def test_superuser_is_admin_and_login_exposes_admin_access(self):
        user_model = get_user_model()
        user = user_model.objects.create_superuser(
            username='real_admin',
            password='SecretPass123',
            email='real-admin@example.com',
            nom='Admin',
            prenom='Principal',
        )
        self.assertEqual(user.role, 'ADMIN')
        response = APIClient().post('/api/auth/login/', {
            'username': 'real_admin',
            'password': 'SecretPass123',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['user']['is_admin'])
        self.assertTrue(response.data['user']['is_superuser'])

    def test_authenticated_user_can_update_profile(self):
        user_model = get_user_model()
        user = user_model.objects.create_user(
            username='profile-user', password='SecretPass123', role='PARENT',
            nom='Ancien', prenom='Nom', email='old@example.com', telephone='0600000000',
        )
        client = APIClient()
        client.force_authenticate(user=user)

        response = client.post('/api/auth/profile/', {
            'nom': 'Nouveau',
            'prenom': 'Profil',
            'email': 'new@example.com',
            'telephone': '0611111111',
            'file': SimpleUploadedFile('avatar.txt', b'ignored'),
        }, format='multipart')

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.nom, 'Nouveau')
        self.assertEqual(user.prenom, 'Profil')
        self.assertEqual(user.email, 'new@example.com')
        self.assertEqual(user.telephone, '0611111111')

    def test_profile_update_rejects_duplicate_email(self):
        user_model = get_user_model()
        user = user_model.objects.create_user(
            username='profile-owner', password='SecretPass123', role='PARENT',
            nom='Utilisateur', prenom='Un', email='one@example.com',
        )
        user_model.objects.create_user(
            username='profile-other', password='SecretPass123', role='PARENT',
            nom='Utilisateur', prenom='Deux', email='two@example.com',
        )
        client = APIClient()
        client.force_authenticate(user=user)

        response = client.post('/api/auth/profile/', {'email': 'two@example.com'}, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['success'], False)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_forgot_password_emails_temporary_password(self):
        user_model = get_user_model()
        user = user_model.objects.create_user(
            username='forgot-user', password='OldPassword123', role='PARENT',
            nom='Compte', prenom='Oublie', email='forgot@example.com',
        )
        client = APIClient()

        response = client.post('/api/auth/forgot-password/', {'username': 'forgot-user'}, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['forgot@example.com'])
        temporary_password = mail.outbox[0].body.split('est : ', 1)[1].split('\n', 1)[0]
        user.refresh_from_db()
        self.assertTrue(user.check_password(temporary_password))
        login_response = client.post('/api/auth/login/', {
            'username': 'forgot-user',
            'password': temporary_password,
        }, format='json')
        self.assertEqual(login_response.status_code, 200)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_forgot_password_does_not_reveal_unknown_username(self):
        response = APIClient().post('/api/auth/forgot-password/', {'username': 'unknown-user'}, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(mail.outbox), 0)


class DirectoryEndpointTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.teacher = user_model.objects.create_user(
            username='teacher01', password='SecretPass123', role='ENSEIGNANT',
            nom='Enseignant', prenom='Principal', email='teacher@example.com',
        )
        self.other_teacher = user_model.objects.create_user(
            username='teacher02', password='SecretPass123', role='ENSEIGNANT',
            nom='Autre', prenom='Enseignant', email='other-teacher@example.com',
        )
        self.parent = user_model.objects.create_user(
            username='parent01', password='SecretPass123', role='PARENT',
            nom='Parent', prenom='Principal', email='parent@example.com',
        )
        self.admin = user_model.objects.create_superuser(
            username='admin01', password='SecretPass123', email='admin@example.com',
            nom='Admin', prenom='Principal',
        )
        Classe.objects.create(nom='4EME', matiere='MATHEMATIQUE', enseignant=self.teacher)
        Classe.objects.create(nom='5EME', matiere='PHYSIQUE_CHIMIE', enseignant=self.teacher)
        Classe.objects.create(nom='CP2', matiere='FRANCAIS', enseignant=self.other_teacher)
        Eleve.objects.create(nom='Eleve', prenom='Un', classe='4eme', parent=self.parent)
        Eleve.objects.create(nom='Eleve', prenom='Deux', classe='5EME', parent=self.parent)
        Eleve.objects.create(nom='Eleve', prenom='Deux', classe='CP2', parent=self.parent)

    def test_teacher_sees_students_from_assigned_classes_only(self):
        client = APIClient()
        client.force_authenticate(user=self.teacher)

        response = client.get('/api/enseignant/eleves/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual([student['prenom'] for student in response.data['eleves']], ['Un', 'Deux'])
        self.assertEqual({student['classe'].upper() for student in response.data['eleves']}, {'4EME', '5EME'})

    def test_teacher_sees_assigned_classes(self):
        client = APIClient()
        client.force_authenticate(user=self.teacher)

        response = client.get('/api/enseignant/classes/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual({classe['nom'] for classe in response.data['classes']}, {'4EME', '5EME'})

    def test_admin_sees_parents_teachers_and_students(self):
        client = APIClient()
        client.force_authenticate(user=self.admin)

        response = client.get('/api/admin/utilisateurs/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['parents']), 1)
        self.assertEqual(len(response.data['enseignants']), 2)
        self.assertEqual(len(response.data['eleves']), 3)

    def test_non_admin_cannot_see_admin_directory(self):
        client = APIClient()
        client.force_authenticate(user=self.teacher)

        response = client.get('/api/admin/utilisateurs/')

        self.assertEqual(response.status_code, 403)

    def test_class_list_returns_students_filtered_by_class_name(self):
        client = APIClient()
        client.force_authenticate(user=self.teacher)

        response = client.get('/api/classes/?classe=4eme')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['classe'], '4eme')
        self.assertEqual(len(response.data['eleves']), 1)
        self.assertEqual(response.data['eleves'][0]['nom'], 'Eleve')
        self.assertEqual(response.data['eleves'][0]['classe'], '4eme')
        self.assertEqual(response.data['eleves'][0]['parent_id'], self.parent.id)

    def test_class_list_accepts_class_name_in_path(self):
        client = APIClient()
        client.force_authenticate(user=self.teacher)

        response = client.get('/api/classes/CP2/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['prenom'] for item in response.data['eleves']], ['Deux'])

    def test_class_search_finds_class_for_scanner_value(self):
        client = APIClient()
        client.force_authenticate(user=self.teacher)

        response = client.post('/api/classes/scanner/', {'code': '4EM'}, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['classes'][0]['nom'], '4EME')
        self.assertEqual(response.data['classes'][0]['eleves_count'], 1)

    def test_class_timetable_returns_entries(self):
        classe = Classe.objects.get(nom='4EME')
        EmploiDuTemps.objects.create(
            classe=classe,
            jour='LUNDI',
            heure_debut='08:00',
            heure_fin='10:00',
            salle='A12',
        )
        client = APIClient()
        client.force_authenticate(user=self.teacher)

        response = client.get('/api/classes/4eme/emploi-du-temps/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['emploi_du_temps'][0]['heure_debut'], '08:00')
        self.assertEqual(response.data['emploi_du_temps'][0]['salle'], 'A12')

    def test_parent_gets_only_children_timetables(self):
        other_class = Classe.objects.create(nom='3EME', matiere='MATHEMATIQUE', enseignant=self.other_teacher)
        EmploiDuTemps.objects.create(
            classe=Classe.objects.get(nom='4EME'), jour='LUNDI',
            heure_debut='08:00', heure_fin='10:00', salle='A12',
        )
        EmploiDuTemps.objects.create(
            classe=other_class, jour='MARDI',
            heure_debut='10:00', heure_fin='12:00', salle='B12',
        )
        client = APIClient()
        client.force_authenticate(user=self.parent)

        response = client.get('/api/emplois-du-temps/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual({item['classe'] for item in response.data['emplois_du_temps']}, {'4EME'})
        self.assertNotIn('3EME', response.data['classes'])

    @patch('membres.views.scan_timetable')
    def test_admin_can_import_timetable_file(self, scan_mock):
        scan_mock.return_value = {
            'nom_fichier': 'planning.pdf',
            'pages': 1,
            'classes': ['4EME'],
            'creneaux': [{
                'classe': '4EME',
                'jour': 'MERCREDI',
                'heure_debut': '14:00',
                'heure_fin': '16:00',
                'matiere': 'MATHEMATIQUE',
                'salle': 'C01',
            }],
        }
        client = APIClient()
        client.force_authenticate(user=self.admin)
        file = SimpleUploadedFile('planning.pdf', b'%PDF', content_type='application/pdf')

        response = client.post('/api/emplois-du-temps/scanner/', {'emploi_du_temps': file}, format='multipart')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['fichiers'][0]['classes'], ['4EME'])
        self.assertTrue(EmploiDuTemps.objects.filter(jour='MERCREDI', salle='C01').exists())

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_teacher_can_send_absence_list(self):
        student = Eleve.objects.get(prenom='Un')
        client = APIClient()
        client.force_authenticate(user=self.teacher)

        response = client.post('/api/absences/', {
            'absences': [{'eleve_id': student.id, 'date': '2026-09-06', 'motif': 'Maladie'}],
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(Absence.objects.get(eleve=student).motif, 'Maladie')
        self.assertEqual(Notification.objects.filter(utilisateur=self.parent, type='ABSENCE').count(), 1)
        client.force_authenticate(user=self.parent)
        notification_response = client.get('/api/notifications/')
        absence_notification = notification_response.data['school_notifications'][0]
        self.assertEqual(absence_notification['nom_eleve'], student.nom)
        self.assertEqual(absence_notification['prenom_eleve'], student.prenom)
        self.assertEqual(absence_notification['date'], '2026-09-06')
        self.assertTrue(absence_notification['heure'])
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.parent.email])

    def test_teacher_can_send_retard_list_and_resend_updates_it(self):
        student = Eleve.objects.get(prenom='Un')
        client = APIClient()
        client.force_authenticate(user=self.teacher)
        payload = {'retards': [{'student_id': student.id, 'date': '2026-09-06', 'minutes': 15}]}

        first_response = client.post('/api/retards/', payload, format='json')
        payload['retards'][0]['minutes'] = 25
        second_response = client.post('/api/retards/', payload, format='json')

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(Retard.objects.filter(eleve=student).count(), 1)
        self.assertEqual(Retard.objects.get(eleve=student).minutes, 25)

    def test_parent_cannot_send_absence_or_retard(self):
        client = APIClient()
        client.force_authenticate(user=self.parent)

        absence_response = client.post('/api/absences/', {'absences': []}, format='json')
        retard_response = client.post('/api/retards/', {'retards': []}, format='json')

        self.assertEqual(absence_response.status_code, 403)
        self.assertEqual(retard_response.status_code, 403)

    def test_parent_can_read_filtered_attendance_histories(self):
        student = Eleve.objects.get(prenom='Un')
        Absence.objects.create(eleve=student, enseignant=self.teacher, date='2026-09-06', motif='Maladie')
        Retard.objects.create(eleve=student, enseignant=self.teacher, date='2026-09-06', minutes=10)
        client = APIClient()
        client.force_authenticate(user=self.parent)

        absence_response = client.get('/api/absences/')
        retard_response = client.get('/api/retards/')

        self.assertEqual(absence_response.status_code, 200)
        self.assertEqual(retard_response.status_code, 200)
        self.assertEqual(absence_response.data['results'][0]['eleve_id'], student.id)
        self.assertEqual(retard_response.data['results'][0]['minutes'], 10)

    @patch('membres.views.scan_bulletin')
    def test_teacher_can_scan_devoir_file_and_history_is_available(self, scan_mock):
        student = Eleve.objects.get(prenom='Un')
        scan_mock.return_value = {
            'nom_fichier': 'devoir.pdf',
            'pages': 1,
            'eleve': {'nom': student.nom, 'prenom': student.prenom, 'classe': student.classe},
            'notes': [
                {'matiere': 'MATHEMATIQUE', 'note': 14.0, 'sur': 20, 'coefficient': None},
                {'matiere': 'FRANCAIS', 'note': 16.0, 'sur': 20, 'coefficient': None},
            ],
            'composition': 15.5,
        }
        client = APIClient()
        client.force_authenticate(user=self.teacher)
        file = SimpleUploadedFile('devoir.pdf', b'%PDF', content_type='application/pdf')

        response = client.post('/api/devoirs/scanner/', {'devoirs': file, 'date': '2026-09-06'}, format='multipart')
        history_response = client.get('/api/devoirs/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'][0]['note1']['note'], 14.0)
        self.assertEqual(response.data['results'][0]['composition'], 15.5)
        self.assertEqual(history_response.status_code, 200)
        self.assertEqual(len(history_response.data['results']), 1)
        self.assertEqual(Devoir.objects.count(), 1)

    def test_parent_notes_endpoint_groups_children_notes_by_trimester_and_subject(self):
        student = Eleve.objects.get(prenom='Un')
        Devoir.objects.create(
            eleve=student,
            enseignant=self.teacher,
            date='2026-09-06',
            trimestre=1,
            matiere='MATHEMATIQUE',
            notes=[
                {'matiere': 'MATHEMATIQUE', 'note': 14.0, 'sur': 20},
                {'matiere': 'MATHEMATIQUE', 'note': 16.0, 'sur': 20},
            ],
            composition=15.5,
        )
        Devoir.objects.create(
            eleve=student,
            enseignant=self.teacher,
            date='2027-01-10',
            trimestre=2,
            matiere='FRANCAIS',
            notes=[{'matiere': 'FRANCAIS', 'note': 13.0, 'sur': 20}],
        )

        client = APIClient()
        client.force_authenticate(user=self.parent)
        response = client.get('/api/parent/notes/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual([(item['nom'], item['prenom']) for item in response.data['eleves']], [
            ('Eleve', 'Deux'), ('Eleve', 'Deux'), ('Eleve', 'Un'),
        ])
        student_data = next(item for item in response.data['eleves'] if item['id'] == student.id)
        self.assertEqual(student_data['trimestres']['1']['matieres']['MATHEMATIQUE']['notes'][1]['note'], 16.0)
        self.assertEqual(student_data['trimestres']['1']['matieres']['MATHEMATIQUE']['compositions'], [15.5])
        self.assertEqual(student_data['trimestres']['2']['matieres']['FRANCAIS']['notes'][0]['note'], 13.0)

        filtered_response = client.get('/api/parent/notes/?trimestre=2')
        self.assertEqual(filtered_response.status_code, 200)
        filtered_student = next(item for item in filtered_response.data['eleves'] if item['id'] == student.id)
        self.assertEqual(set(filtered_student['trimestres']), {'2'})

    def test_parent_notes_endpoint_rejects_invalid_trimester(self):
        client = APIClient()
        client.force_authenticate(user=self.parent)

        response = client.get('/api/parent/notes/?trimestre=4')

        self.assertEqual(response.status_code, 400)

    def test_analysis_routes_are_available_to_authenticated_parent(self):
        client = APIClient()
        client.force_authenticate(user=self.parent)

        statistics = client.get('/api/parent/statistiques/')
        ai_analysis = client.get('/api/parent/analyse-ia/')

        self.assertEqual(statistics.status_code, 200)
        self.assertEqual(ai_analysis.status_code, 200)
        self.assertIn('global', statistics.data)
        self.assertIn('analyse_ia', ai_analysis.data)


class MessagingEndpointTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.teacher = user_model.objects.create_user(
            username='teacher-message', password='SecretPass123', role='ENSEIGNANT',
            nom='Prof', prenom='Classe', email='teacher-message@example.com',
        )
        self.other_teacher = user_model.objects.create_user(
            username='teacher-other-message', password='SecretPass123', role='ENSEIGNANT',
            nom='Prof', prenom='Autre', email='teacher-other-message@example.com',
        )
        self.parent = user_model.objects.create_user(
            username='parent-message', password='SecretPass123', role='PARENT',
            nom='Parent', prenom='Classe', email='parent-message@example.com',
        )
        self.other_parent = user_model.objects.create_user(
            username='parent-other-message', password='SecretPass123', role='PARENT',
            nom='Parent', prenom='Autre', email='parent-other-message@example.com',
        )
        self.admin = user_model.objects.create_superuser(
            username='admin-message', password='SecretPass123', email='admin-message@example.com',
            nom='Admin', prenom='Messagerie',
        )
        Classe.objects.create(nom='4EME', matiere='MATHEMATIQUE', enseignant=self.teacher)
        Classe.objects.create(nom='CP2', matiere='FRANCAIS', enseignant=self.other_teacher)
        Eleve.objects.create(nom='Eleve', prenom='Classe', classe='4eme', parent=self.parent)
        Eleve.objects.create(nom='Eleve', prenom='Autre', classe='CP2', parent=self.other_parent)
        self.client = APIClient()

    def test_parent_contacts_admin_and_child_class_teacher_only(self):
        self.client.force_authenticate(user=self.parent)
        response = self.client.get('/api/messages/contacts/')
        contact_ids = {contact['id'] for contact in response.data['contacts']}
        self.assertEqual(contact_ids, {self.admin.id, self.teacher.id})

    def test_teacher_contacts_admin_and_parents_of_assigned_class_only(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get('/api/messages/contacts/')
        contact_ids = {contact['id'] for contact in response.data['contacts']}
        self.assertEqual(contact_ids, {self.admin.id, self.parent.id})

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_message_send_enforces_allowed_recipient(self):
        self.client.force_authenticate(user=self.parent)
        forbidden = self.client.post('/api/messages/', {
            'destinataire_id': self.other_teacher.id,
            'contenu': 'Bonjour',
        }, format='json')
        self.assertEqual(forbidden.status_code, 403)
        allowed = self.client.post('/api/messages/', {
            'destinataire_id': self.teacher.id,
            'contenu': 'Bonjour professeur',
        }, format='json')
        self.assertEqual(allowed.status_code, 201)
        self.assertTrue(Message.objects.filter(emetteur=self.parent, destinataire=self.teacher).exists())
        self.assertEqual(Notification.objects.filter(utilisateur=self.teacher, type='MESSAGE').count(), 1)
        self.client.force_authenticate(user=self.teacher)
        message_notifications = self.client.get('/api/notifications/?type=MESSAGE')
        self.assertEqual(message_notifications.data['message_notifications'][0]['auteur']['id'], self.parent.id)
        self.assertTrue(message_notifications.data['message_notifications'][0]['date'])
        self.assertTrue(message_notifications.data['message_notifications'][0]['heure'])
        self.assertEqual(len(mail.outbox), 0)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_event_notifies_all_users_and_click_updates_count(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/evenements/', {
            'date': '2026-10-01',
            'titre': 'Réunion',
            'contenu': 'Réunion de rentrée',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(mail.outbox), 5)

        self.client.force_authenticate(user=self.parent)
        notifications = self.client.get('/api/notifications/')
        self.assertEqual(notifications.data['count'], 1)
        notification_id = notifications.data['notifications'][0]['id']
        clicked = self.client.post(f'/api/notifications/{notification_id}/click/', {}, format='json')
        self.assertEqual(clicked.status_code, 200)
        self.assertEqual(clicked.data['count'], 0)

    def test_admin_can_be_contacted_by_parent_and_teacher(self):
        for sender in (self.parent, self.teacher):
            self.client.force_authenticate(user=sender)
            response = self.client.post('/api/messages/', {
                'destinataire_id': self.admin.id,
                'contenu': 'Message a l administration',
            }, format='json')
            self.assertEqual(response.status_code, 201)

    def test_conversation_returns_old_and_new_messages_in_chronological_order(self):
        Message.objects.create(
            emetteur=self.teacher,
            destinataire=self.parent,
            contenu='Ancien message',
        )
        Message.objects.create(
            emetteur=self.parent,
            destinataire=self.teacher,
            contenu='Nouveau message',
        )
        self.client.force_authenticate(user=self.parent)

        response = self.client.get(f'/api/messages/{self.teacher.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [message['contenu'] for message in response.data['messages']],
            ['Ancien message', 'Nouveau message'],
        )
        self.assertEqual(response.data['interlocuteur']['id'], self.teacher.id)

    def test_conversation_rejects_unauthorized_interlocutor(self):
        self.client.force_authenticate(user=self.parent)

        response = self.client.get(f'/api/messages/{self.other_teacher.id}/')

        self.assertEqual(response.status_code, 403)

    def test_parent_can_send_and_receive_audio_message_aliases(self):
        self.client.force_authenticate(user=self.parent)
        audio = SimpleUploadedFile('message.webm', b'audio-data', content_type='audio/webm')

        upload_response = self.client.post(
            '/api/messages/',
            {'destinataire_id': self.teacher.id, 'voice': audio},
            format='multipart',
        )

        self.assertEqual(upload_response.status_code, 201)
        uploaded_data = upload_response.data['message']
        self.assertEqual(uploaded_data['type'], 'audio')
        self.assertEqual(uploaded_data['audio_url'], uploaded_data['voice_url'])
        self.assertEqual(uploaded_data['sender']['id'], self.parent.id)

        url_response = self.client.post('/api/messages/', {
            'destinataire_id': self.teacher.id,
            'audio_url': 'https://cdn.example.test/message.mp3',
        }, format='json')

        self.assertEqual(url_response.status_code, 201)
        self.assertEqual(url_response.data['message']['media'], 'https://cdn.example.test/message.mp3')

    def test_parent_bulletins_and_timetables_routes_are_scoped(self):
        student = Eleve.objects.get(prenom='Classe')
        classe = Classe.objects.get(nom='4EME')
        Devoir.objects.create(
            eleve=student, enseignant=self.teacher, date='2026-09-06',
            matiere='MATHEMATIQUE', notes=[{'note': 15}],
        )
        EmploiDuTemps.objects.create(
            classe=classe, jour='LUNDI', heure_debut='08:00', heure_fin='10:00', salle='A12',
        )
        self.client.force_authenticate(user=self.parent)

        bulletins = self.client.get('/api/parent/bulletins/')
        timetables = self.client.get('/api/parent/emplois-du-temps/')

        self.assertEqual(bulletins.status_code, 200)
        self.assertEqual(bulletins.data['bulletins'][0]['id'], student.id)
        self.assertEqual(timetables.status_code, 200)
        self.assertEqual(timetables.data['emplois_du_temps'][0]['classe'], '4EME')


class BulletinScannerEndpointTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username='bulletin-user', password='SecretPass123', role='PARENT',
            nom='Parent', prenom='Bulletin', email='bulletin@example.com',
        )
        self.student = Eleve.objects.create(nom='Diallo', prenom='Amina', classe='4EME', parent=self.user)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    @patch('membres.bulletin_scanner.extract_pdf_text')
    def test_scanner_returns_student_and_grades(self, extract_pdf_text):
        extract_pdf_text.return_value = (
            'Nom: Diallo\nPrenom: Amina\nClasse: 4EME\n'
            'Mathematiques: 15/20 coef 2\nFrancais: 13,5/20',
            1,
        )
        pdf = SimpleUploadedFile('bulletin.pdf', b'%PDF-test', content_type='application/pdf')

        response = self.client.post('/api/bulletins/scanner/', {'fichier': pdf}, format='multipart')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['bulletin']['eleve'], {
            'nom': 'Diallo', 'prenom': 'Amina', 'classe': '4EME',
        })
        self.assertEqual(response.data['bulletin']['notes'][0]['note'], 15.0)
        self.assertEqual(response.data['bulletin']['notes'][0]['coefficient'], 2.0)
        self.assertEqual(response.data['bulletin']['notes'][1]['note'], 13.5)
        self.assertEqual(response.data['bulletin']['eleve_id'], self.student.id)

    def test_scanner_requires_a_file(self):
        response = self.client.post('/api/bulletins/scanner/', {}, format='multipart')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['champs_fichiers_recus'], [])

    def test_scanner_rejects_non_pdf(self):
        document = SimpleUploadedFile('bulletin.txt', b'Nom: Test')

        response = self.client.post('/api/bulletins/scanner/', {'fichier': document}, format='multipart')

        self.assertEqual(response.status_code, 422)

    @patch('membres.bulletin_scanner.extract_pdf_text')
    def test_scanner_accepts_multiple_bulletins(self, extract_pdf_text):
        extract_pdf_text.side_effect = [
            ('Nom: Diallo\nPrenom: Amina\nClasse: 4EME\nMathematiques: 15/20', 1),
            ('Nom: Diallo\nPrenom: Amina\nClasse: 4EME\nFrancais: 13/20', 1),
        ]
        first_pdf = SimpleUploadedFile('premier.pdf', b'%PDF-first', content_type='application/pdf')
        second_pdf = SimpleUploadedFile('deuxieme.pdf', b'%PDF-second', content_type='application/pdf')

        response = self.client.post(
            '/api/bulletins/scanner/',
            {'bulletins': [first_pdf, second_pdf]},
            format='multipart',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['bulletins']), 2)
        self.assertNotIn('bulletin', response.data)
