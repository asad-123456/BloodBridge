# BloodBridge Setup Instructions

This document explains how to get the BloodBridge platform running locally on your machine for development and testing.

## Prerequisites
- **Docker** and **Docker Compose**
- **Node.js** (v18 or higher) and **npm**
- **Python 3.10+** (if running the backend locally outside Docker)
- **PostgreSQL** (with **PostGIS** extension, if running DB outside Docker)

## 1. Environment Configuration

### Backend
1. Copy the `.env.example` in the `backend/` directory to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Update the `.env` file with your credentials. You must provide a valid `CLOUDINARY_URL` and `DATABASE_URL` (the default `DATABASE_URL` points to the Docker Compose database).

### Frontend
1. Copy the `.env.example` in the `frontend/` directory to `.env.local`:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
2. By default, `VITE_API_BASE_URL` should point to `http://localhost:8000`.

## 2. Running via Docker Compose (Recommended)

The entire stack (Frontend, Backend, and PostGIS Database) is containerized and can be orchestrated via Docker Compose.

1. From the root `BloodBridge` directory, build and start the containers:
   ```bash
   docker-compose up --build
   ```
2. The services will be available at:
   - **Frontend:** http://localhost:5173
   - **Backend API:** http://localhost:8000
   - **API Documentation (Swagger):** http://localhost:8000/docs
3. (Optional) If you need to run Alembic database migrations manually inside the backend container:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

## 3. Running Locally (Without Docker)

If you prefer to run the components directly on your host machine for active development:

### Database (PostgreSQL + PostGIS)
You must have a Postgres server running with the PostGIS extension installed.
```sql
CREATE DATABASE bloodbridge;
\c bloodbridge
CREATE EXTENSION postgis;
```

### Backend (FastAPI)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   alembic upgrade head
   ```
5. Start the server:
   ```bash
   fastapi run main.py
   ```

### Frontend (React + Vite)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 4. Testing with Multiple Users
Because BloodBridge uses `localStorage` for authentication, logging in to two different accounts in the same browser window will overwrite the session. 
To test interactions between a Citizen and a Hospital simultaneously:
- Open the Citizen Portal in a normal Chrome window.
- Open the Hospital Portal in an **Incognito / Private Window** (or a different browser like Firefox).
