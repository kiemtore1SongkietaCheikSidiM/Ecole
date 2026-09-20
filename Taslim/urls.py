"""Table de routage HTTP du projet Taslim.

Les routes `/api/` deleguent la logique metier a `membres.views`, tandis que
`/admin/` expose l'interface d'administration Django.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from membres.views import admin_users, class_list, class_options, class_timetable, click_notification, create_absences, create_retards, devoir_history, evenements, forgot_password, login_user, me, message_contacts, message_conversation, messages, notifications, parent_bulletins, parent_grades, parent_timetables, parents_with_students, performance_ai_analysis, performance_statistics, register_user, scan_bulletin_pdf, scan_class, scan_devoir_files, scan_timetable_files, teacher_classes, teacher_students, timetables, update_profile


def health_check(request):
    """Reponse legere utilisee par le frontend ou un outil de supervision."""
    return JsonResponse({'status': 'ok', 'message': 'API Django ready'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    path('api/auth/register/', register_user, name='register_user'),
    path('api/auth/login/', login_user, name='login_user'),
    path('api/auth/forgot-password/', forgot_password, name='forgot_password'),
    path('api/auth/me/', me, name='me'),
    path('api/auth/profile/', update_profile, name='update_profile'),
    path('api/absences/', create_absences, name='create_absences'),
    path('api/retards/', create_retards, name='create_retards'),
    path('api/devoirs/', devoir_history, name='devoir_history'),
    path('api/parent/notes/', parent_grades, name='parent_grades'),
    path('api/parent/bulletins/', parent_bulletins, name='parent_bulletins'),
    path('api/parent/statistiques/', performance_statistics, name='performance_statistics'),
    path('api/parent/analyse-ia/', performance_ai_analysis, name='performance_ai_analysis'),
    path('api/parent/emplois-du-temps/', parent_timetables, name='parent_timetables'),
    path('api/devoirs/scanner/', scan_devoir_files, name='scan_devoir_files'),
    path('api/documents/devoirs/', devoir_history, name='document_devoir_history'),
    path('api/parents/eleves/', parents_with_students, name='parents_with_students'),
    path('api/enseignant/eleves/', teacher_students, name='teacher_students'),
    path('api/enseignant/classes/', teacher_classes, name='teacher_classes'),
    path('api/classes/', class_list, name='class_list'),
    path('api/classes/scanner/', scan_class, name='scan_class'),
    path('api/classes/recherche/', scan_class, name='class_search'),
    path('api/classes/<str:classe>/emploi-du-temps/', class_timetable, name='class_timetable'),
    path('api/emplois-du-temps/', timetables, name='timetables'),
    path('api/emplois-du-temps/scanner/', scan_timetable_files, name='scan_timetable_files'),
    path('api/classes/<str:classe>/', class_list, name='class_list_by_name'),
    path('api/admin/utilisateurs/', admin_users, name='admin_users'),
    path('api/classes/options/', class_options, name='class_options'),
    path('api/messages/contacts/', message_contacts, name='message_contacts'),
    path('api/messages/<int:interlocuteur_id>/', message_conversation, name='message_conversation'),
    path('api/messages/', messages, name='messages'),
    path('api/notifications/', notifications, name='notifications'),
    path('api/notifications/<int:notification_id>/click/', click_notification, name='click_notification'),
    path('api/evenements/', evenements, name='evenements'),
    path('api/bulletins/scanner/', scan_bulletin_pdf, name='scan_bulletin_pdf'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
