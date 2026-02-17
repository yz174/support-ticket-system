from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    """
    Serializer for Ticket model - handles all CRUD operations.
    """
    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'category', 'priority', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']


class TicketCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating tickets with validation.
    """
    class Meta:
        model = Ticket
        fields = ['title', 'description', 'category', 'priority']
    
    def validate_title(self, value):
        """Ensure title is not empty and within length limit."""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        if len(value) > 200:
            raise serializers.ValidationError("Title cannot exceed 200 characters.")
        return value.strip()
    
    def validate_description(self, value):
        """Ensure description is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()


class ClassifyRequestSerializer(serializers.Serializer):
    """
    Serializer for LLM classification request.
    """
    description = serializers.CharField(required=True, allow_blank=False)
    
    def validate_description(self, value):
        """Ensure description is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()


class ClassifyResponseSerializer(serializers.Serializer):
    """
    Serializer for LLM classification response.
    """
    suggested_category = serializers.ChoiceField(
        choices=Ticket.CATEGORY_CHOICES,
        required=False,
        allow_null=True
    )
    suggested_priority = serializers.ChoiceField(
        choices=Ticket.PRIORITY_CHOICES,
        required=False,
        allow_null=True
    )


class StatsSerializer(serializers.Serializer):
    """
    Serializer for aggregated statistics.
    """
    total_tickets = serializers.IntegerField()
    open_tickets = serializers.IntegerField()
    avg_tickets_per_day = serializers.FloatField()
    priority_breakdown = serializers.DictField()
    category_breakdown = serializers.DictField()
