from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('membres', '0005_emploi_du_temps'),
    ]

    operations = [
        migrations.CreateModel(
            name='Absence',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('motif', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('eleve', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='absences', to='membres.eleve')),
                ('enseignant', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='absences_saisies', to='membres.utilisateur')),
            ],
            options={
                'db_table': 'absence',
                'ordering': ['-date', 'eleve__nom', 'eleve__prenom'],
            },
        ),
        migrations.CreateModel(
            name='Retard',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('minutes', models.PositiveIntegerField(default=0)),
                ('motif', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('eleve', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='retards', to='membres.eleve')),
                ('enseignant', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='retards_saisis', to='membres.utilisateur')),
            ],
            options={
                'db_table': 'retard',
                'ordering': ['-date', 'eleve__nom', 'eleve__prenom'],
            },
        ),
        migrations.AddConstraint(
            model_name='absence',
            constraint=models.UniqueConstraint(fields=('eleve', 'date'), name='absence_eleve_date_unique'),
        ),
        migrations.AddConstraint(
            model_name='retard',
            constraint=models.UniqueConstraint(fields=('eleve', 'date'), name='retard_eleve_date_unique'),
        ),
    ]