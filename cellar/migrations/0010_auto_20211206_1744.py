# Generated by Django 3.2.9 on 2021-12-06 22:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cellar', '0009_entry_flagged'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='phone_cell',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='contact',
            name='phone_office',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
    ]
