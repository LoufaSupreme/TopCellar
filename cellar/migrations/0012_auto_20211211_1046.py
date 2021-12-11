# Generated by Django 3.2.9 on 2021-12-11 15:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('cellar', '0011_auto_20211206_1753'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='company',
            field=models.ForeignKey(blank=True, default='', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='contacts', to='cellar.customer'),
        ),
        migrations.AlterField(
            model_name='contact',
            name='email',
            field=models.EmailField(blank=True, default='', max_length=254, null=True),
        ),
        migrations.AlterField(
            model_name='contact',
            name='last_name',
            field=models.CharField(blank=True, default='', max_length=55, null=True),
        ),
        migrations.AlterField(
            model_name='contact',
            name='notes',
            field=models.TextField(blank=True, default='', null=True),
        ),
        migrations.AlterField(
            model_name='contact',
            name='phone_cell',
            field=models.CharField(blank=True, default='', max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='contact',
            name='phone_office',
            field=models.CharField(blank=True, default='', max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='contact',
            name='position',
            field=models.CharField(blank=True, default='', max_length=155, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='address',
            field=models.ForeignKey(blank=True, default='', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='customers', to='cellar.address'),
        ),
        migrations.AlterField(
            model_name='customer',
            name='industry',
            field=models.CharField(blank=True, default='', max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='notes',
            field=models.TextField(blank=True, default='', null=True),
        ),
        migrations.AlterField(
            model_name='entry',
            name='customer',
            field=models.ForeignKey(blank=True, default='', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='entries', to='cellar.customer'),
        ),
        migrations.AlterField(
            model_name='entry',
            name='rank',
            field=models.PositiveIntegerField(blank=True, default='', null=True),
        ),
        migrations.AlterField(
            model_name='tag',
            name='name',
            field=models.CharField(blank=True, default='', max_length=100, null=True),
        ),
    ]
