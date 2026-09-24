<p align="center">
  <img src="./docs/bloodbridge_logo.png" alt="BloodBridge" width="350" />
</p>

# BloodBridge

BloodBridge is an intelligent, real-time blood matching and institutional inventory platform built for the **Alkhidmat Foundation Blood Donor Network**.

Our mission is to eliminate blood shortages during critical emergencies by instantly connecting patients in need with the closest eligible blood donors and partner blood banks. 

## How It Works

Traditional blood donation networks often suffer from fragmented communication, leading to critical delays. BloodBridge solves this through a localized, geospatial matching algorithm:

1. **A Request is Made:** A patient's family requests blood via the mobile app, or a hospital initiates a request directly.
2. **Hospital Verification:** The receiving hospital verifies the request in the web portal to prevent spam and ensure medical necessity.
3. **Geospatial Matching:** The BloodBridge algorithm instantly scans the region using **PostGIS**, finding eligible donors within a strict radius who have not donated in the last 90 days.
4. **Live BloodFeed:** Matched donors check their live BloodFeed, which surfaces requests within their geospatial radius, allowing them to commit and head to the hospital.
5. **Institutional Backup:** If no donors are available, partnered blood banks (like regional Red Crescent centers) are notified and can fulfill the request directly from their cold-storage inventory.

## Core Features & Medical Guardrails

BloodBridge is built with strict real-world medical rules to ensure safety and reliability:

*   **The 90-Day Cooldown:** Donors are mathematically locked out of the matching pool for 3 months after a successful donation to protect their health.
*   **Reliability Scoring (Flake Penalties):** Donors who accept an emergency request but fail to show up are automatically penalized in the algorithm, prioritizing highly reliable donors for future emergencies.
*   **Spam Prevention:** Only "Emergency" requests trigger mass push notifications. "Routine" requests are quietly routed to institutional dashboards to prevent mobile notification fatigue.
*   **Dual-Mode Interface:** The web portals can be instantly switched into "Demo Mode" for training hospital staff offline without polluting the live database.

---

## Technical Architecture

BloodBridge is split into two primary layers:

### 1. The Web Management Portal (React 19 + TypeScript)
A Single Page Application serving three distinct institutional stakeholders:
- **Super Admin Portal (`/admin`)**: For network administrators to approve new hospitals, manage user trust labels, and view network-wide analytics.
- **Hospital Portal (`/hospital`)**: For doctors and nurses to verify incoming patient blood requests.
- **Partner Portal (`/partner`)**: For partnered blood banks to fulfill verified requests from their cold storage.

### 2. The Core API (FastAPI + PostgreSQL)
The brain of the platform. Built in Python 3.11, it uses `PostGIS` for geospatial donor mapping, `JWT/Argon2` for secure stateless authentication, and `APScheduler` for sweeping expired requests.

---

## Developer Quickstart (Docker)

The entire platform has been heavily containerized. You do not need to install Python, Node, or PostgreSQL locally.

### 1. Configure Environment
In the root directory, configure the backend and frontend `.env` files using their respective templates:
```bash
# Windows
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env

# macOS/Linux
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
*Note: The default `.env.example` values are already pre-configured to work instantly with the local Docker containers.*

### 2. Spin Up the Stack
From the root directory, run:
```bash
docker compose up --build -d
```

This master orchestration will boot:
1. **PostGIS Database**: Local PostgreSQL with geospatial extensions.
2. **Backend API**: Python FastAPI (`http://localhost:8000`). Migrations run automatically. Swagger UI available at `http://localhost:8000/docs`.
3. **Frontend Web Portal**: React 19 SPA running behind Nginx (`http://localhost:3000`).
4. **Adminer**: Lightweight Database GUI (`http://localhost:8080`).

---

## Mobile Team Handover

If you are developing the React Native / Flutter consumer mobile app, the backend API is ready to consume. 
**Next Steps for Mobile Devs:**
1. **Firebase Cloud Messaging (FCM)**: The backend calculates geospatial donor matches, 90-day cooldowns, and reliability scores, but the final physical push notification is stubbed out in `backend/src/utils/notifications.py`. You must add your Firebase `google-services.json` and initialize the Firebase Admin SDK to turn live push notifications on.
2. **API Consumption**: Open `http://localhost:8000/docs` while the Docker containers are running to see the fully documented OpenAPI schema for the Mobile App endpoints.

---

## Demo Accounts

For offline UI testing and evaluator demonstrations, use the seeded demo credentials. These mock the UI without hitting the live database:

| Portal | Email | Password |
|---|---|---|
| **Admin** | `demo_admin@hemalink.com` | `DemoAdmin@123` |
| **Hospital** | `demo_hospital@hemalink.com` | `DemoHospital@123` |
| **Partner** | `demo_partner@hemalink.com` | `DemoPartner@123` |

---

## Documentation

- **[`docs/developer-handover.md`](./docs/developer-handover.md)**: Current system context, architectural alignment, audit matrix, and immediate roadmap.
- **[`docs/changelog.md`](./docs/changelog.md)**: Version history of architectural changes and UI/UX updates.
- **[`docs/PRD.md`](./docs/PRD.md)**: Product Requirements Document and screen specifications.
- **[`docs/design.md`](./docs/design.md)**: Design system tokens, color palettes, and component guidelines.
