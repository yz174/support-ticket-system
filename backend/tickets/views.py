from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Ticket
from .serializers import (
    TicketSerializer,
    TicketCreateSerializer,
    ClassifyRequestSerializer,
    ClassifyResponseSerializer,
    StatsSerializer
)
from .services.llm_classifier import get_classifier
import logging

logger = logging.getLogger(__name__)


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Ticket CRUD operations with filtering and search.
    
    Endpoints:
    - GET /api/tickets/ - List all tickets with optional filters
    - POST /api/tickets/ - Create a new ticket
    - GET /api/tickets/{id}/ - Retrieve a specific ticket
    - PATCH /api/tickets/{id}/ - Update a ticket
    - DELETE /api/tickets/{id}/ - Delete a ticket
    """
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    
    def get_queryset(self):
        """
        Filter tickets based on query parameters.
        Supports: category, priority, status, and search (title + description).
        """
        queryset = Ticket.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by status
        ticket_status = self.request.query_params.get('status', None)
        if ticket_status:
            queryset = queryset.filter(status=ticket_status)
        
        # Search in title and description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')  # Newest first
    
    def create(self, request, *args, **kwargs):
        """Create a new ticket."""
        serializer = TicketCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the ticket
        ticket = Ticket.objects.create(**serializer.validated_data)
        
        # Return the created ticket
        response_serializer = TicketSerializer(ticket)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def partial_update(self, request, *args, **kwargs):
        """Update a ticket (e.g., change status, override category/priority)."""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class StatsView(APIView):
    """
    API view for aggregated ticket statistics.
    
    Endpoint: GET /api/tickets/stats/
    
    Returns:
    - total_tickets: Total number of tickets
    - open_tickets: Number of tickets with status='open'
    - avg_tickets_per_day: Average tickets created per day
    - priority_breakdown: Count of tickets by priority
    - category_breakdown: Count of tickets by category
    """
    
    def get(self, request):
        """Get aggregated statistics using database-level aggregation."""
        # Total tickets
        total_tickets = Ticket.objects.count()
        
        # Open tickets
        open_tickets = Ticket.objects.filter(status=Ticket.STATUS_OPEN).count()
        
        # Average tickets per day
        if total_tickets > 0:
            # Get the oldest ticket date
            oldest_ticket = Ticket.objects.order_by('created_at').first()
            if oldest_ticket:
                days_since_first = (timezone.now() - oldest_ticket.created_at).days + 1
                avg_tickets_per_day = round(total_tickets / days_since_first, 1)
            else:
                avg_tickets_per_day = 0.0
        else:
            avg_tickets_per_day = 0.0
        
        # Priority breakdown using database aggregation
        priority_breakdown = {}
        priority_counts = Ticket.objects.values('priority').annotate(count=Count('id'))
        for item in priority_counts:
            priority_breakdown[item['priority']] = item['count']
        
        # Ensure all priorities are represented (even if count is 0)
        for priority_choice, _ in Ticket.PRIORITY_CHOICES:
            if priority_choice not in priority_breakdown:
                priority_breakdown[priority_choice] = 0
        
        # Category breakdown using database aggregation
        category_breakdown = {}
        category_counts = Ticket.objects.values('category').annotate(count=Count('id'))
        for item in category_counts:
            category_breakdown[item['category']] = item['count']
        
        # Ensure all categories are represented (even if count is 0)
        for category_choice, _ in Ticket.CATEGORY_CHOICES:
            if category_choice not in category_breakdown:
                category_breakdown[category_choice] = 0
        
        # Prepare response data
        stats_data = {
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'avg_tickets_per_day': avg_tickets_per_day,
            'priority_breakdown': priority_breakdown,
            'category_breakdown': category_breakdown,
        }
        
        # Validate with serializer
        serializer = StatsSerializer(data=stats_data)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.data)


class ClassifyView(APIView):
    """
    API view for LLM-based ticket classification.
    
    Endpoint: POST /api/tickets/classify/
    
    Request body:
    {
        "description": "I can't access my account from the VPN..."
    }
    
    Response:
    {
        "suggested_category": "technical",
        "suggested_priority": "high"
    }
    
    Returns empty suggestions if LLM is unavailable or fails.
    """
    
    def post(self, request):
        """Classify a ticket description using LLM."""
        # Validate request
        request_serializer = ClassifyRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        
        description = request_serializer.validated_data['description']
        
        # Get LLM classifier
        classifier = get_classifier()
        
        # Classify the description
        result = classifier.classify(description)
        
        if result:
            # LLM classification succeeded
            response_data = {
                'suggested_category': result.get('suggested_category'),
                'suggested_priority': result.get('suggested_priority'),
            }
        else:
            # LLM classification failed - return empty suggestions
            logger.warning("LLM classification failed. Returning empty suggestions.")
            response_data = {
                'suggested_category': None,
                'suggested_priority': None,
            }
        
        # Validate response
        response_serializer = ClassifyResponseSerializer(data=response_data)
        response_serializer.is_valid(raise_exception=True)
        
        return Response(response_serializer.data)
