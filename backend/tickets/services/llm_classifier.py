"""
LLM Classification Service using Google Gemini API.

This service provides automatic categorization and priority suggestion
for support tickets based on their description.
"""

import json
import logging
from typing import Optional, Dict
from django.conf import settings

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

logger = logging.getLogger(__name__)


class LLMClassifier:
    """
    Classifier that uses Gemini LLM to suggest ticket category and priority.
    """
    
    # Classification prompt template
    CLASSIFICATION_PROMPT = """You are a support ticket classification assistant. Analyze the following ticket description and suggest:
1. Category: billing, technical, account, or general
2. Priority: low, medium, high, or critical

Description: {description}

Respond ONLY with JSON in this exact format (no markdown, no code blocks, just raw JSON):
{{"category": "...", "priority": "..."}}

Guidelines:
- billing: Payment issues, invoices, subscriptions, refunds
- technical: Software bugs, connectivity issues, performance problems, errors
- account: Login problems, password resets, profile updates, permissions
- general: Questions, feedback, feature requests, other inquiries

- critical: System down, data loss, security breach, blocking multiple users
- high: Significant functionality broken, blocking work, urgent deadline
- medium: Feature not working as expected, workaround available
- low: Minor issues, questions, enhancement requests"""
    
    def __init__(self):
        """Initialize the Gemini API client."""
        self.api_key = settings.GEMINI_API_KEY
        self.model = None
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not configured. LLM classification will be disabled.")
            return
        
        if not GENAI_AVAILABLE:
            logger.error("google-generativeai package not installed. LLM classification will be disabled.")
            return
        
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("Gemini LLM classifier initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API: {e}")
            self.model = None
    
    def classify(self, description: str) -> Optional[Dict[str, str]]:
        """
        Classify a ticket description and return suggested category and priority.
        
        Args:
            description: The ticket description text
            
        Returns:
            Dictionary with 'suggested_category' and 'suggested_priority' keys,
            or None if classification fails
        """
        if not self.model:
            logger.warning("LLM model not available. Skipping classification.")
            return None
        
        if not description or not description.strip():
            logger.warning("Empty description provided for classification.")
            return None
        
        try:
            # Format the prompt with the description
            prompt = self.CLASSIFICATION_PROMPT.format(description=description.strip())
            
            # Generate response from Gemini
            logger.info(f"Sending classification request to Gemini for description: {description[:50]}...")
            response = self.model.generate_content(prompt)
            
            if not response or not response.text:
                logger.error("Empty response from Gemini API.")
                return None
            
            # Parse the JSON response
            response_text = response.text.strip()
            logger.info(f"Received response from Gemini: {response_text}")
            
            # Try to extract JSON if it's wrapped in markdown code blocks
            if response_text.startswith('```'):
                # Remove markdown code block markers
                lines = response_text.split('\n')
                response_text = '\n'.join(line for line in lines if not line.startswith('```'))
                response_text = response_text.strip()
            
            # Parse JSON
            result = json.loads(response_text)
            
            # Validate the response format
            category = result.get('category', '').lower()
            priority = result.get('priority', '').lower()
            
            # Validate category
            valid_categories = ['billing', 'technical', 'account', 'general']
            if category not in valid_categories:
                logger.warning(f"Invalid category '{category}' from LLM. Using 'general' as fallback.")
                category = 'general'
            
            # Validate priority
            valid_priorities = ['low', 'medium', 'high', 'critical']
            if priority not in valid_priorities:
                logger.warning(f"Invalid priority '{priority}' from LLM. Using 'medium' as fallback.")
                priority = 'medium'
            
            return {
                'suggested_category': category,
                'suggested_priority': priority
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response from Gemini: {e}. Response: {response_text}")
            return None
        except Exception as e:
            logger.error(f"Error during LLM classification: {e}")
            return None


# Singleton instance
_classifier_instance = None


def get_classifier() -> LLMClassifier:
    """Get or create the singleton LLM classifier instance."""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = LLMClassifier()
    return _classifier_instance
