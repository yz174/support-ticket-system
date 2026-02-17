from django.db import models
from django.utils import timezone


class Ticket(models.Model):
    """
    Support Ticket model with LLM-suggested categorization and priority.
    """
    
    # Category choices
    CATEGORY_BILLING = 'billing'
    CATEGORY_TECHNICAL = 'technical'
    CATEGORY_ACCOUNT = 'account'
    CATEGORY_GENERAL = 'general'
    
    CATEGORY_CHOICES = [
        (CATEGORY_BILLING, 'Billing'),
        (CATEGORY_TECHNICAL, 'Technical'),
        (CATEGORY_ACCOUNT, 'Account'),
        (CATEGORY_GENERAL, 'General'),
    ]
    
    # Priority choices
    PRIORITY_LOW = 'low'
    PRIORITY_MEDIUM = 'medium'
    PRIORITY_HIGH = 'high'
    PRIORITY_CRITICAL = 'critical'
    
    PRIORITY_CHOICES = [
        (PRIORITY_LOW, 'Low'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_HIGH, 'High'),
        (PRIORITY_CRITICAL, 'Critical'),
    ]
    
    # Status choices
    STATUS_OPEN = 'open'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_RESOLVED = 'resolved'
    STATUS_CLOSED = 'closed'
    
    STATUS_CHOICES = [
        (STATUS_OPEN, 'Open'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_RESOLVED, 'Resolved'),
        (STATUS_CLOSED, 'Closed'),
    ]
    
    # Fields
    title = models.CharField(
        max_length=200,
        help_text="Brief title of the support ticket"
    )
    
    description = models.TextField(
        help_text="Detailed description of the issue"
    )
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        help_text="Category of the ticket (auto-suggested by LLM, user can override)"
    )
    
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        help_text="Priority level (auto-suggested by LLM, user can override)"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_OPEN,
        help_text="Current status of the ticket"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the ticket was created"
    )
    
    class Meta:
        ordering = ['-created_at']  # Newest first
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['category']),
            models.Index(fields=['priority']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"#{self.pk} - {self.title}"
