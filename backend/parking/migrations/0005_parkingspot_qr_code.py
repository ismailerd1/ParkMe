# Generated by Django 5.0.6 on 2024-07-10 14:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('parking', '0004_parkingspot_capacity_parkingspot_hourlyrate_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='parkingspot',
            name='qr_code',
            field=models.ImageField(blank=True, null=True, upload_to='qr_codes'),
        ),
    ]
