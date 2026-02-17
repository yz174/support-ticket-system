import axios from 'axios';

// Base URL for the API - will be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all tickets with optional filters
 * @param {Object} filters - Optional filters (category, priority, status, search)
 * @returns {Promise} Array of tickets
 */
export const getTickets = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.category) params.append('category', filters.category);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);

  const response = await apiClient.get(`/api/tickets/?${params.toString()}`);
  return response.data;
};

/**
 * Create a new ticket
 * @param {Object} ticketData - Ticket data (title, description, category, priority)
 * @returns {Promise} Created ticket object
 */
export const createTicket = async (ticketData) => {
  const response = await apiClient.post('/api/tickets/', ticketData);
  return response.data;
};

/**
 * Update a ticket
 * @param {number} ticketId - ID of the ticket to update
 * @param {Object} updates - Fields to update
 * @returns {Promise} Updated ticket object
 */
export const updateTicket = async (ticketId, updates) => {
  const response = await apiClient.patch(`/api/tickets/${ticketId}/`, updates);
  return response.data;
};

/**
 * Fetch aggregated statistics
 * @returns {Promise} Statistics object
 */
export const getTicketStats = async () => {
  const response = await apiClient.get('/api/tickets/stats/');
  return response.data;
};

/**
 * Classify a ticket description using LLM
 * @param {string} description - Ticket description
 * @returns {Promise} Object with category and priority
 */
export const classifyTicket = async (description) => {
  try {
    const response = await apiClient.post('/api/tickets/classify/', { description });
    // Map backend response (suggested_category) to frontend expectation (category)
    return {
      category: response.data.suggested_category,
      priority: response.data.suggested_priority
    };
  } catch (error) {
    console.error('Error classifying ticket:', error);
    // Return empty suggestions on error
    return {
      category: null,
      priority: null,
    };
  }
};

export default apiClient;
