# BloodBridge - Codebase Analysis & Developer Handover
**Date**: 2026-09-19
**Status**: MVP completed, ready for QA & Infrastructure Integration (Firebase/Tests)

This document provides a holistic analysis of the BloodBridge codebase, evaluating its current state and detailing the exact integration points for developers taking over the project to implement Firebase Cloud Messaging (FCM) and automated testing.

## 1. Codebase Health & Current State

The codebase is in a stable, functioning state. A recent bug-squashing sweep resolved critical API crashes (e.g., admin metrics), decoupled the inventory controller, removed redundant endpoints, and hardened the frontend state management against race conditions.

### **Frontend (`frontend/src/`)**
*   **Framework**: React 19, React Router v7, Vite, Tailwind CSS, TypeScript.
*   **State Management**: Handled via `AppStateContext.tsx`. 
    *   *Note for Devs*: The context operates in a **Dual-Mode**. If `isDemoUser` is true (determined by `demoUserIds` in `mockData.ts`), the app runs entirely off `localStorage` mock data. Real API calls are only triggered for live users holding a JWT.
*   **Health**: Excellent modularization. Pages and routes are clearly separated by role (`/admin`, `/hospital`, `/partner`). API calls in `client.ts` have been recently typed with strict `Promise<T>` generics.

### **Backend (`backend/src/`)**
*   **Framework**: FastAPI, SQLAlchemy, Alembic, PostgreSQL with PostGIS.
*   **Auth**: Stateless JWTs hashed with Argon2, incorporating a `password_changed_at` check in the DB to allow for global session invalidation on password resets.
*   **Health**: The backend strictly follows a `router.py` -> `controller.py` -> `models.py` pattern. PostGIS is heavily utilized for matching donors based on geospatial radius (`ST_DWithin`).

---

## 2. Infrastructure & Integration Backlog (Next Steps)

The following areas were purposefully deferred for the infrastructure engineering team.

### Task 1: Firebase Cloud Messaging (FCM) Integration
Currently, the backend perfectly calculates *who* to notify based on blood type, radius, and active status, but does not actually send the payload.

**Integration Points:**
1.  **Frontend Device Tokens**: 
    *   The frontend needs Firebase initialized. You must request notification permissions from the user (specifically Donors) and retrieve the FCM device token.
    *   Update the backend `Donor` model/endpoints to accept and store this `device_token`.
2.  **Backend Dispatch**:
    *   **File**: `backend/src/blood_requests/notifications.py`
    *   **Function**: `notify_donors_for_request(blood_request, db, trigger)`
    *   **Action**: At line ~105, replace the `TODO` with the actual Firebase Admin SDK dispatch. You will receive a list of eligible `Donor` objects (which should now contain `device_token`s). Send the push notification payloads and handle cleanup for unregistered/stale tokens.

### Task 2: Automated Testing Suite
There are currently **zero** automated tests in the repository.

**Integration Points:**
1.  **Backend (`pytest`)**:
    *   Set up a `pytest` environment with a separate, ephemeral PostgreSQL+PostGIS database.
    *   **Critical paths to test**: Geo-radius matching in `notifications.py`, concurrency locks/IntegrityErrors in `request_matches/controller.py` (preventing double-booking of blood requests), and role-based access control.
2.  **Frontend (`vitest` / `playwright`)**:
    *   Since the app has a robust demo mode, you can write Playwright end-to-end tests entirely against the `isDemoUser` mock state without needing a live backend.
    *   Test the complex UI interactions in `AppStateContext.tsx` like hospital verification and partner fulfillment.

### Task 3: Context Decomposition (Optional but Recommended)
The `AppStateContext.tsx` file is >500 lines long. As the app scales, this should be broken down into domain-specific contexts (e.g., `AdminContext`, `HospitalContext`, `PartnerContext`) or migrated to a state manager like Zustand to prevent unnecessary re-renders across the portal boundaries.

