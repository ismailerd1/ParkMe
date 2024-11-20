from django.urls import path, include
from .views import CustomUserViewSet, RegisterView, Register2View, LoginView, logout_view, ParkingSpotViewSet, StartParkingSession, EndParkingSession, AddCreditView, ConfirmPaymentView, active_session, own_parkspots, last_parks, ReportList
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'parkingspots', ParkingSpotViewSet)
router.register(r'profile',CustomUserViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('register2/', Register2View.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
    path('logout', logout_view, name='logout'),
    path('start-session/<int:parkingspot_id>/', StartParkingSession.as_view(), name='start-session'),
    path('end-session/<int:session_id>/', EndParkingSession.as_view(), name='end-session'),
    path('active-session/<int:user_id>/', active_session, name='active-session'),
    path('own-parkspot/<int:user_id>/', own_parkspots, name='own-parkspot'),
    path('last-parks/<int:user_id>/', last_parks, name='last-parks'),
    path('add-credit/', AddCreditView.as_view(), name='add-credit'),
    path('confirm-payment/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('reports/', ReportList.as_view(), name='report-list'),
]
