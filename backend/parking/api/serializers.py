from rest_framework import serializers
from django.contrib.auth.models import User
from ..models import CustomUser, ParkingSpot, ParkingSession, Report
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ( 'username', 'password')

    def create(self, validated_data):
        username = validated_data['username']
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError("There is already an account with that username!")
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user
        
        

class CustomUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    credit = serializers.CharField(read_only=True)
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = CustomUser
        fields = ('id','fullname', 'number', 'plate', 'username', 'credit')

    def create(self, validated_data):
        username = validated_data.pop('username')
        number = validated_data.get('number')
        plate = validated_data.get('plate')
        
        
        if CustomUser.objects.filter(number=number).exists():
            raise serializers.ValidationError({"number": "There is already an account with that number!"})
        if CustomUser.objects.filter(plate=plate).exists():
            raise serializers.ValidationError({"plate": "There is already an account with that plate!"})

        user = get_object_or_404(User, username=username)
        customuser = CustomUser.objects.create(user=user, **validated_data)
        return customuser
        
    def update(self, instance, validated_data):
        instance.fullname = validated_data.get('fullname', instance.fullname)
        instance.number = validated_data.get('number', instance.number)
        instance.plate = validated_data.get('plate', instance.plate)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")
        
        custom_user = CustomUser.objects.get(user=user)
        data['user_id'] = custom_user.id
        data['user'] = user
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'fullname', 'number', 'plate')


class ParkingSpotSerializer(serializers.ModelSerializer):
    number = serializers.CharField(write_only=True)
    qr_code_url = serializers.ImageField(source='qr_code', read_only=True)
    class Meta:
        model = ParkingSpot
        fields = ['id', 'name', 'owner', 'lat', 'lng', 'description', 'hourlyrate', 'capacity', 'number', 'qr_code_url']

    def create(self, validated_data):
        try:
            number = validated_data.pop('number')
            customuser = CustomUser.objects.get(number=number)
            parkspot = ParkingSpot.objects.create(owner=customuser, **validated_data)
            
            parkspot.generate_qr_code()
            parkspot.save()            
            return parkspot
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"number": "CustomUser matching with that number does not exist."})
        except Exception as e:
            raise serializers.ValidationError("Failed to create ParkSpot", e)


class ParkingSessionSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    parkingspot = ParkingSpotSerializer(read_only=True)
    starttime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    endtime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = ParkingSession
        fields = ['id', 'user', 'parkingspot', 'starttime', 'endtime', 'price']

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['title', 'description', 'created_at']
        read_only_fields = ['phone_number']