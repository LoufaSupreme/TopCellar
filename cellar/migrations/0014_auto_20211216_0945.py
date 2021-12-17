# Generated by Django 3.2.9 on 2021-12-16 14:45

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('cellar', '0013_auto_20211212_2151'),
    ]

    operations = [
        migrations.AddField(
            model_name='entry',
            name='date_archived',
            field=models.DateTimeField(default=None, null=True),
        ),
        migrations.AddField(
            model_name='entry',
            name='date_completed',
            field=models.DateTimeField(default=None, null=True),
        ),
        migrations.AddField(
            model_name='entry',
            name='date_edited',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='entry',
            name='date_flagged',
            field=models.DateTimeField(default=None, null=True),
        ),
    ]