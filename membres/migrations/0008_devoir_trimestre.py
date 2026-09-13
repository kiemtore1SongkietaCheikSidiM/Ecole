from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('membres', '0007_devoir'),
    ]

    operations = [
        migrations.AddField(
            model_name='devoir',
            name='trimestre',
            field=models.PositiveSmallIntegerField(
                choices=[(1, 'Trimestre 1'), (2, 'Trimestre 2'), (3, 'Trimestre 3')],
                default=1,
            ),
        ),
    ]