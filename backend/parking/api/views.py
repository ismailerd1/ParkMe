from ..models import CustomUser, ParkingSpot, ParkingSession, Report
from .serializers import CustomUserSerializer,LoginSerializer, UserSerializer,UserProfileSerializer, ParkingSpotSerializer, ParkingSessionSerializer, ReportSerializer

from rest_framework import status, generics, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view

from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User

from django.utils import timezone
from rest_framework.permissions import AllowAny

from django.conf import settings
import stripe
stripe.api_key = settings.STRIPE_SECRET_KEY        
from decimal import Decimal


class CustomUserViewSet(ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"detail": "Error during user save"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.exceptions import ValidationError
class Register2View(APIView):
    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"detail": f"Error during user save: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            customuserid = serializer.validated_data['user_id']
            login(request, user)
            return Response({'message': 'Login successful' ,
                'customuserid': customuserid}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
    
class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user.customuser

class ParkingSpotViewSet(viewsets.ModelViewSet):
    queryset = ParkingSpot.objects.all()
    serializer_class = ParkingSpotSerializer

    def create(self, request, *args, **kwargs):
        number = request.data.get('number')
        try:
            customuser = CustomUser.objects.get(number=number)
        except CustomUser.DoesNotExist:
            return Response({'error': 'CustomUser matching query does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'An error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return super().create(request, *args, **kwargs)
    

class StartParkingSession(APIView):
    permission_classes = [AllowAny]
    def post(self, request, parkingspot_id):
        user_id = request.data.get('user_id')
        user = CustomUser.objects.get(pk=user_id)
        parkingspot = ParkingSpot.objects.get(pk=parkingspot_id)
        
        session = ParkingSession.objects.create(user=user, parkingspot=parkingspot)
        parkingspot.decrease_capacity()
        session_serializer = ParkingSessionSerializer(session)
        return Response({'message': 'Parking session started', 'session': session_serializer.data}, status=status.HTTP_201_CREATED)

class EndParkingSession(APIView):
    permission_classes = [AllowAny]
    def post(self, request, session_id):
        session = ParkingSession.objects.get(pk=session_id)
        session.endtime = timezone.now()
        session.calculate_price()
        
        user = session.user
        owner = session.parkingspot.owner
        
        user.credit -= session.price
        owner.credit += session.price
        user.save()
        owner.save()
        session.parkingspot.increase_capacity()
        session_serializer = ParkingSessionSerializer(session)
        return Response({'message': 'Parking session ended and payment successful', 'session': session_serializer.data}, status=status.HTTP_200_OK)

        
@api_view(['GET'])
def active_session(request, user_id):
    active_sessions = ParkingSession.objects.filter(user_id=user_id, endtime__isnull=True)
    if active_sessions.exists():
        session = active_sessions.last()
        spotid = session.parkingspot.id
        return Response({'active': True, 'session_id': session.id ,'spotid': spotid})
    return Response({'active': False})

@api_view(['GET'])
def own_parkspots(request, user_id):
    owner =  CustomUser.objects.get(id=user_id)
    owned_parkspots = ParkingSpot.objects.filter(owner = owner)
    serializer = ParkingSpotSerializer(owned_parkspots, many=True)
    if owned_parkspots.exists():
        return Response(serializer.data)
    return Response('You dont have any parkspot')

@api_view(['GET'])
def last_parks(request, user_id):
    user =  CustomUser.objects.get(id=user_id)
    parks = ParkingSession.objects.filter(user = user)
    serializer = ParkingSessionSerializer(parks, many=True)
    if parks.exists():
        return Response(serializer.data)
    return Response('You dont have park history')
        

class AddCreditView(APIView):
    def post(self, request, *args, **kwargs):
        amount = request.data.get('amount')
        user_id = request.data.get('user_id')

        if not amount or not user_id:
            return Response({"error": "Amount and user_id are required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(float(amount) * 100),
                currency='usd',
                metadata={'user_id': user.id}
            )
            return Response({
                'client_secret': intent['client_secret'],
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConfirmPaymentView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            payment_intent_id = request.data.get('payment_intent_id')
            user_id = request.data.get('user_id')
            amount_str = request.data.get('amount')
            amount = Decimal(amount_str) if amount_str else Decimal('0.00')
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if payment_intent['status'] == 'succeeded':
                user = CustomUser.objects.get(id=user_id)
                user.credit +=amount
                user.save()
                return Response({'message': 'Payment already succeeded'}, status=status.HTTP_200_OK)
            elif payment_intent['status'] == 'requires_confirmation':
                payment_intent = stripe.PaymentIntent.confirm(payment_intent_id)

                if payment_intent['status'] == 'succeeded':
                    user = CustomUser.objects.get(id=user_id)
                    user.credit = user.credit + amount
                    user.save()
                    return Response({'message': 'Payment successful', 'new amount:':user.credit}, status=status.HTTP_200_OK)
                else:
                    return Response({'message': 'Payment failed'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message': 'Payment status not suitable for confirmation'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.StripeError as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ReportList(APIView):
    def post(self, request):
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)