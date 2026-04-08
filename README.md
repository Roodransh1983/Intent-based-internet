# Intent-Based Internet

Transform intentions into actionable AI-powered roadmaps.

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
python -m http.server 8080
# or use any static server
```

## Access
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Features
- PWA with offline support
- JWT authentication
- IndexedDB local storage
- Background sync
- AI-powered roadmaps
