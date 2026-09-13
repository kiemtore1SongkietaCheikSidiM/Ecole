from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('membres', '0006_absence_retard'),
    ]

    operations = [
        migrations.CreateModel(
            name='Devoir',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('matiere', models.CharField(blank=True, max_length=150)),
                ('notes', models.JSONField(default=list)),
                ('composition', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('nom_fichier', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('eleve', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='devoirs', to='membres.eleve')),
                ('enseignant', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='devoirs_scannes', to='membres.utilisateur')),
            ],
            options={
                'db_table': 'devoir',
                'ordering': ['-date', 'eleve__nom', 'eleve__prenom'],
            },
        ),
    ]