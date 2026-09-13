from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('membres', '0004_message'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmploiDuTemps',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('jour', models.CharField(choices=[('LUNDI', 'Lundi'), ('MARDI', 'Mardi'), ('MERCREDI', 'Mercredi'), ('JEUDI', 'Jeudi'), ('VENDREDI', 'Vendredi'), ('SAMEDI', 'Samedi')], max_length=10)),
                ('heure_debut', models.TimeField()),
                ('heure_fin', models.TimeField()),
                ('salle', models.CharField(blank=True, max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('classe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='emplois_du_temps', to='membres.classe')),
            ],
            options={
                'db_table': 'emploi_du_temps',
                'ordering': ['jour', 'heure_debut'],
            },
        ),
        migrations.AddConstraint(
            model_name='emploidutemps',
            constraint=models.UniqueConstraint(fields=('classe', 'jour', 'heure_debut'), name='emploi_classe_jour_debut_unique'),
        ),
    ]