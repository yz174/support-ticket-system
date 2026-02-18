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
    CLASSIFICATION_PROMPT = """You are an expert support ticket classification assistant. Analyze the ticket description and suggest the most accurate category and priority.

Description: {description}

Respond ONLY with JSON in this exact format (no markdown, no code blocks, just raw JSON):
{{"category": "...", "priority": "..."}}

CATEGORY GUIDELINES:
• technical: Bugs, errors, crashes, performance issues, connectivity problems, software malfunctions, broken features, system failures
  Keywords: bug, error, crash, broken, not working, failed, issue, problem, glitch, freeze, slow, timeout
  
• billing: Payment processing, invoices, charges, refunds, subscriptions, pricing, double charges, failed payments
  Keywords: payment, invoice, charge, refund, subscription, billing, price, cost, paid, money
  
• account: Login issues, authentication, passwords, profile access, permissions, user settings, account security
  Keywords: login, password, access, sign in, authentication, profile, permission, locked out, account
  
• general: Questions, feedback, feature requests, how-to inquiries, Documentation, general information
  Keywords: how to, question, suggestion, feedback, feature request, information, help with

PRIORITY GUIDELINES:
• critical: Complete system outage, data loss, security breach, payment system down, affects all/many users, revenue impact
  Indicators: "down", "not accessible", "security", "breach", "data loss", "everyone affected", "can't access at all"
  Examples: "entire system is down", "data breach detected", "payment gateway offline"

• high: Core functionality broken, blocking critical work, user completely unable to perform key tasks, bugs affecting production
  Indicators:"broken", "can't", "unable to", "blocking", "urgent", "asap", "critical feature", "production issue"
  Examples: "can't submit orders", "bug on checkout page", "unable to access dashboard", "profile screen not loading"
  
• medium: Feature not working as expected but workarounds exist, non-critical bugs, moderate inconvenience, delayed response acceptable
  Indicators: "bug", "sometimes", "occasionally", "minor issue", "not working properly", "would like", "could you"
  Examples: "search is slow", "formatting looks off", "would like to change settings"
  
• low: Cosmetic issues, minor annoyances, questions, enhancement requests, nice-to-have features, documentation requests
  Indicators: "question", "how do I", "wondering", "enhancement", "suggestion", "would be nice", "documentation"
  Examples: "how do I export reports?", "can you add dark mode?", "typo in help text"

DECISION RULES:
1. Bug/Error mentions → Start with "high" priority unless clearly minor
2. Vague descriptions with urgency words ("bug", "broken", "not working") → Assume "high" priority
3. User cannot complete their work → "high" or "critical"
4. Questions and how-to requests → "low" priority
5. Payment/billing issues → Usually "high" (revenue impact)
6. Account access issues → "high" (user is blocked)
7. Feature requests and suggestions → "low" unless critical business need stated

When in doubt between two priorities, choose the HIGHER priority to ensure urgent issues are addressed promptly."""
    
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
            # Use gemini-1.5-flash for faster responses, or gemini-1.5-pro for better accuracy
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            logger.info("Gemini LLM classifier initialized successfully with gemini-2.5-flash.")
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
