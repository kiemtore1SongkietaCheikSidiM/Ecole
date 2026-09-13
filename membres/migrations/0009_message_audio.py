from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('membres', '0008_devoir_trimestre'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='contenu',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='message',
            name='audio',
            field=models.FileField(blank=True, null=True, upload_to='messages/audio/'),
        ),
        migrations.AddField(
            model_name='message',
            name='media_url',
            field=models.URLField(blank=True),
        ),
    ]