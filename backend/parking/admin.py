from django.contrib import admin
from .models import CustomUser, ParkingSpot, ParkingSession, Report
# Register your models here.

admin.site.register(CustomUser)
admin.site.register(ParkingSpot)
admin.site.register(ParkingSession)

class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'phone_number', 'created_at')
    search_fields = ('title',)

admin.site.register(Report, ReportAdmin)