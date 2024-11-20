from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

# Create your models here.


class CustomUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    fullname = models.CharField(max_length=255, null=True)
    number = models.CharField(max_length=15, null=True)
    plate = models.CharField(max_length=10, null=True)
    credit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return str(self.user)
    

class ParkingSpot(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='parking_spots', null=True) 
    lat = models.FloatField()
    lng = models.FloatField()
    description = models.TextField()
    hourlyrate = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    capacity = models.IntegerField(null=True)
    qr_code = models.ImageField(upload_to='qr_codes', blank=True, null=True)

    def generate_qr_code(self):
        import qrcode
        from io import BytesIO
        from django.core.files import File

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr_data = f'http://localhost:5173/parkspot/{self.id}'
        qr.add_data(qr_data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer)
        file_name = f'{self.id}_qr.png'
        self.qr_code.save(file_name, File(buffer), save=False)

    def decrease_capacity(self):
        if self.capacity > 0:
            self.capacity -= 1
            self.save()

    def increase_capacity(self):
        self.capacity += 1
        self.save()


class ParkingSession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='parking_sessions')
    parkingspot = models.ForeignKey(ParkingSpot, on_delete=models.CASCADE, related_name='sessions')
    starttime = models.DateTimeField(auto_now_add=True)
    endtime = models.DateTimeField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)


    def calculate_price(self):
        if self.endtime:
            duration = self.endtime - self.starttime
            hours = duration.total_seconds() / 3600  
            if hours<= 1:
                hours = 1
            hourly_rate_decimal = Decimal(self.parkingspot.hourlyrate)
            self.price = hourly_rate_decimal * Decimal(hours)
            self.save()


class Report(models.Model):
    title = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, null=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title