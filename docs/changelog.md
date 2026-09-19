# BloodBridge - Changelog

This document serves as a running history of major architectural changes, bug fixes, and feature implementations applied to the BloodBridge platform. 

---

## [2026-09-19 13:05:00] - UI/UX Polish (Fast Wins)
### Added
- **Global Toast Notifications**: Integrated `react-hot-toast` across the platform. Removed disjointed inline error/success messages in favor of clean, non-blocking toast popups in the top-center of the screen.
- **Illustrated Empty States**: Upgraded empty lists (e.g., "No institutions found") from plain text to polished container states using Lucide-react icons and softer branding.
- **Sticky Form Validation**: Forms across Hospital Verification and Partner Fulfillment now properly throw visible toast errors instead of failing silently.

---

## [2026-09-19 13:00:00] - Full-Stack Dockerization
### Added
- **Root Orchestration (`docker-compose.yml`)**: Created a master `docker-compose.yml` at the project root to orchestrate the Frontend, Backend, PostGIS Database, and Adminer instances.
- **Backend Containerization**: Added a `Dockerfile` using `python:3.11-slim`. It handles system dependencies for PostGIS (`libpq-dev`), installs Python requirements, and executes `alembic upgrade head` before booting the FastAPI `uvicorn` server.
- **Frontend Containerization**: Added a multi-stage `Dockerfile` using `node:20-alpine` and `nginx:alpine`. Includes a custom `nginx.conf` to properly route Single Page Application (SPA) requests back to `index.html`.
- **Docker Ignores**: Added `.dockerignore` files for both frontend and backend to prevent `node_modules` and `.venv` bloat during image builds.

---

## [2026-09-19 12:20:00] - Security & Medical Guardrails Implementation


### Added
- **Global Haptic Feedback**
  - Added visual active states (`scale-[0.97]`) to all buttons in `index.css`.
  - Added native mobile vibration (`navigator.vibrate`) via a global `pointerdown` listener in `main.tsx`.
  - *Impact*: Greatly improves UI feel and responsiveness, making the web portal feel closer to a native app on mobile and desktop.
- **Donor Medical Cooldowns (90-Day Rule)**
  - Added `eligible_after` timestamp column to the `donors` database table.
  - *Impact*: The backend now automatically locks a donor out of geo-searches and notifications for 90 days after they successfully complete a donation. This enforces critical medical safety guidelines.
- **Donor Reliability Score (Flake Penalties)**
  - Added `reliability_score` (default 100) integer column to the `donors` table.
  - *Impact*: If a donor accepts an emergency request but cancels it, the backend deducts 10 points. This builds the foundation for suspending abusive or unreliable users in high-stakes emergencies.
- **Alembic Migration Script**
  - Generated `f01c350b20ab_add_donor_medical_cooldown_and_flake_.py`.
  - *Impact*: Developers can seamlessly upgrade their local PostgreSQL instances to include the new columns without manually writing SQL.

### Changed
- **Notification Spam Prevention**
  - Modified `find_donors_to_notify` in `notifications.py` to abort immediately if a request urgency is `ROUTINE`.
  - *Impact*: Mobile users will only receive push notifications for `URGENT` or `CRITICAL` requests, preventing app deletion due to notification fatigue.
- **Admin Hospital Registration Flow**
  - Removed plaintext `password` inputs from `InstitutionApprovals.tsx`.
  - *Impact*: Dramatically improves security. The Admin portal now uses an "Invite-Link" paradigm where the backend handles sending a secure activation link via email, preventing admins from manually setting and sharing weak passwords.
- **Mobile Team Instructions**
  - Updated `instructions-for-mobile-team.md` to document the new `eligible_after` and `reliability_score` variables so the mobile team can build UI components (like a "Recovery Timer" or "Trust Score") around them.

---

## [2026-09-19 11:39:00] - P0/P1 Stability Sweep


### Fixed
- **Admin Metrics Crash (P0)**: Fixed a `NameError` crash in `admin/controller.py` by adding the missing `BloodRequest` import. 
- **Silent Fulfillment Failures**: Added `async/await` and `try/catch` wrappers in `StockFulfillmentDetail.tsx` to surface backend rejection errors to partners instead of blindly navigating away.
- **Double Submission Guards**: Added `isSubmitting` disabled states across critical Admin and Hospital approval buttons.
- **Monolith Hydration Race Conditions**: Added `AbortController` cleanup and network `try/catch` re-throws inside the massive `AppStateContext.tsx` to prevent React from crashing on unhandled promise rejections.

### Removed
- Removed the redundant `POST /{request_id}/verify` endpoint, forcing clients to correctly use the notification-triggering `PATCH /{request_id}/hospital-verify` route.
- Stripped the orphaned `/api/v1` prefix from the Inventory module to normalize the API root.

