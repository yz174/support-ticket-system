from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, StatsView, ClassifyView

# Create a router for the ViewSet
router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    # Custom endpoints MUST come before router.urls to avoid conflicts
    path('tickets/stats/', StatsView.as_view(), name='ticket-stats'),
    path('tickets/classify/', ClassifyView.as_view(), name='ticket-classify'),
    
    # ViewSet routes (list, create, retrieve, update, destroy)
    path('', include(router.urls)),
]
