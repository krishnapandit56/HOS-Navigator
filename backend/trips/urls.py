from django.urls import path
from .views import PlanTripView, PresetTripsView, health_check

urlpatterns = [
    path('trips/plan/', PlanTripView.as_view(), name='plan-trip'),
    path('trips/presets/', PresetTripsView.as_view(), name='preset-trips'),
    path('health/', health_check, name='health-check'),
]
