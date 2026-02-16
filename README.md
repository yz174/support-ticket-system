# Support Ticket System

A full-stack support ticket management system with AI-powered auto-categorization using Google Gemini LLM. Built with Django REST Framework, React, PostgreSQL, and Docker.

## Features

### Backend (Django REST Framework)
- **RESTful API** with full CRUD operations for support tickets
- **Advanced Filtering** - Filter tickets by category, priority, status, and search by title/description
- **Database-Level Aggregations** - Efficient statistics calculation using Django ORM
- **LLM Integration** - Automatic ticket categorization and priority suggestion using Gemini API
- **Graceful Error Handling** - System continues to work even if LLM service is unavailable

### Frontend (React + Vite)
- **Modern Dark UI** - Sleek, professional interface with glassmorphism effects
- **AI-Powered Form** - Real-time ticket classification as users type
- **Interactive Dashboard** - View, filter, and manage tickets with ease
- **Live Statistics** - Real-time analytics with priority and category breakdowns
- **Responsive Design** - Works seamlessly on desktop and mobile devices

### Infrastructure (Docker)
- **Single-Command Deployment** - `docker-compose up --build`
- **Automatic Migrations** - Database schema created automatically on startup
- **Service Health Checks** - Ensures services start in the correct order
- **Environment-Based Configuration** - Easy customization via environment variables

## Prerequisites

- Docker and Docker Compose installed
- Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd support-ticket-system
```

### 2. Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

Or set the environment variable directly:
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your_actual_api_key_here"

# Linux/Mac
export GEMINI_API_KEY="your_actual_api_key_here"
```

### 3. Start the Application
```bash
docker-compose up --build
```

This single command will:
- Start PostgreSQL database
- Run Django migrations automatically
- Start the Django backend server
- Start the React frontend development server

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/tickets/
- **Django Admin**: http://localhost:8000/admin/ (username: `admin`, password: `admin123`)

## API Endpoints

### Tickets
- `POST /api/tickets/` - Create a new ticket
- `GET /api/tickets/` - List all tickets (supports filtering)
  - Query params: `?category=technical&priority=high&status=open&search=vpn`
- `GET /api/tickets/{id}/` - Get a specific ticket
- `PATCH /api/tickets/{id}/` - Update a ticket (e.g., change status)
- `DELETE /api/tickets/{id}/` - Delete a ticket

### Statistics
- `GET /api/tickets/stats/` - Get aggregated statistics
  ```json
  {
    "total_tickets": 124,
    "open_tickets": 67,
    "avg_tickets_per_day": 8.3,
    "priority_breakdown": {
      "low": 30,
      "medium": 52,
      "high": 31,
      "critical": 11
    },
    "category_breakdown": {
      "billing": 28,
      "technical": 55,
      "account": 22,
      "general": 19
    }
  }
  ```

### LLM Classification
- `POST /api/tickets/classify/` - Classify a ticket description
  ```json
  {
    "description": "Cannot access VPN from remote location"
  }
  ```
  Response:
  ```json
  {
    "suggested_category": "technical",
    "suggested_priority": "high"
  }
  ```

## Project Structure

```
support-ticket-system/
├── backend/
│   ├── support_ticket_system/     # Django project settings
│   ├── tickets/                   # Tickets app
│   │   ├── models.py             # Ticket model
│   │   ├── serializers.py        # DRF serializers
│   │   ├── views.py              # API views
│   │   ├── urls.py               # URL routing
│   │   └── services/
│   │       └── llm_classifier.py # Gemini LLM integration
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── TicketForm.jsx
│   │   │   ├── TicketCard.jsx
│   │   │   ├── TicketList.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   └── StatsBoard.jsx
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── App.jsx
│   │   └── App.css
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Data Model

### Ticket Model
| Field | Type | Constraints |
|-------|------|-------------|
| title | CharField | max_length=200, required |
| description | TextField | required |
| category | CharField | choices: billing, technical, account, general |
| priority | CharField | choices: low, medium, high, critical |
| status | CharField | choices: open, in_progress, resolved, closed (default: open) |
| created_at | DateTimeField | auto-set on creation |

All constraints are enforced at the database level using Django's field validators and choices.

## LLM Integration Details

The system uses Google's Gemini API to automatically suggest ticket categories and priorities based on the description. The classification prompt is carefully engineered to provide accurate suggestions:

- **Categories**: billing, technical, account, general
- **Priorities**: low, medium, high, critical

The LLM service includes:
- Graceful error handling - tickets can still be created if LLM fails
- Response validation - ensures suggestions match valid choices
- Fallback values - uses sensible defaults if LLM returns invalid data

## Development

### Running Without Docker

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Running Tests
```bash
# Backend tests
docker-compose exec backend python manage.py test

# Or without Docker
cd backend
python manage.py test
```

## Technologies Used

- **Backend**: Django 5.0, Django REST Framework, PostgreSQL, psycopg3
- **Frontend**: React 18, Vite, Axios
- **LLM**: Google Gemini API (gemini-pro model)
- **Infrastructure**: Docker, Docker Compose
- **Styling**: Custom CSS with modern dark theme


