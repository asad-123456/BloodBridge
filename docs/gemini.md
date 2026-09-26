# Gemini Engineering Tracking

This document serves as the persistent memory and engineering log for the Gemini AI agent working on BloodBridge.

## Architectural Rules & Strict Guidelines
1. **Never mock data in Alembic Migrations**: Migrations must strictly define schema. Data seeding is done via isolated Python scripts.
2. **Never hardcode Admin credentials in the DB**: The Admin account is completely separate from standard roles and relies strictly on `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
3. **Admin Email Protection**: The backend controllers (`donors`, `organizations`, `hospitals`) explicitly block the `ADMIN_EMAIL` from being registered as a standard user account to prevent confusion.
4. **No Push Notifications**: We are operating purely as a web application for now. Avoid implementing Firebase or FCM logic.
5. **UI Injections via Python**: When replacing React component logic, strictly verify that the new HTML string accurately targets the old string (use regex if necessary) to avoid silent failures.
6. **Graceful Degradation**: Always provide fallback logic (e.g. `BloodFeed` failing over to `Base Location` when Live GPS is denied).
7. **Pydantic Validation Feedback**: Backend validation errors (422s) MUST bubble up into visible error banners in the frontend.

## Recently Resolved Bugs (Post-Audit)
- **PortalLogin Text Misalignment**: The Citizen login screen improperly asked "Need to register your institution?" (Fixed to "Don't have an account?").
- **MyRequests Broken Link**: The empty state pointed to a non-existent `/citizen/create-request` route. Fixed to `/citizen/new-request`.
- **UrgencyBadge Casing Issue**: The backend API returns urgency in lowercase (`urgent`, `critical`), but the frontend badge did a case-sensitive check against `Urgent`, causing emergencies to render as gray `routine` badges. Fixed.
- **Missing Loading States & Error Banners**: Added explicit `error` banner rendering to `UserSignup.tsx` so Pydantic validation errors (like missing country codes) are visible.
- **BloodFeed Fallback Failure**: The frontend GPS fallback was silently failing and leaving the feed empty. Completely rewrote the `useEffect` to safely trigger `fetchFallback()`.

## Active Feature Injections (Sept 25, 2026)
- **Base Location Enforced**: Citizens must pinpoint their location on an interactive Leaflet map during registration.
- **Searchable BloodFeed**: Users can now type a city/area into the BloodFeed to fetch emergencies across different geographic regions, bypassing their base/live location.
- **Create Request Search**: Added an interactive search bar above the Leaflet map when creating an emergency request to speed up coordinate plotting.
