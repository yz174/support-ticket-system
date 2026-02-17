from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, StatsView, ClassifyView

# Create a router for the ViewSet
router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    # ViewSet routes (list, create, retrieve, update, destroy)
    path('', include(router.urls)),
    
    # Custom endpoints
    path('tickets/stats/', StatsView.as_view(), name='ticket-stats'),
    path('tickets/classify/', ClassifyView.as_view(), name='ticket-classify'),
]
