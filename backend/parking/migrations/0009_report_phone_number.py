# Generated by Django 5.1.3 on 2024-11-20 09:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('parking', '0008_report'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='phone_number',
            field=models.CharField(max_length=15, null=True),
        ),
    ]
