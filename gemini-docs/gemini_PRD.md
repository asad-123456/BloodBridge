# BloodBridge Product Requirements Document (PRD)

## Vision
BloodBridge is a hyper-local, real-time blood donation network that connects citizens, hospitals, and partner organizations through a seamless, geospatially-aware matching algorithm. It aims to eliminate the friction in emergency blood sourcing by intelligently routing requests to eligible nearby donors.

## Core Roles & Permissions
1. **Citizen (Donor / Requester)**: Can broadcast emergency blood requests, donate blood to open requests, manage their cooldown periods, and chat with requesters.
2. **Hospital**: A verified institution that receives patient requests from Citizens. Hospitals verify that a patient is genuinely admitted and needs blood, acting as the primary trust layer.
3. **Partner Organization**: A highly trusted entity (e.g. Al Khidmat Foundation) that can directly broadcast pre-verified blood requests and manage large-scale stock fulfillment.
4. **System Admin**: Manages the approval pipeline for Hospitals and Organizations, and monitors system health/metrics. (Managed via secure env variables).

## Key Features & User Flows

### 1. Geospatial Fallback Architecture
- **Base Location Setup**: Citizens define their permanent Base Location via an interactive map during registration.
- **Live Feed Fallback**: The BloodFeed dynamically attempts to acquire the user's Live GPS to show them requests exactly where they currently stand. If denied or timed out, it gracefully degrades to using their saved Base Location.
- **Searchable Areas**: Donors can actively search for different cities/areas in the feed to view remote emergencies.

### 2. Request Lifecycle
1. **Creation**: Citizen creates a request and tags a hospital.
2. **Pending Verification**: The request enters the Hospital's verification queue.
3. **Activation**: The hospital approves the request, or a Trusted Organization creates it, immediately pushing it to `ACTIVE`.
4. **Fulfillment**: A Donor accepts the request, travels to the location, and marks the donation as `COMPLETED`.
5. **Cooldown**: The Donor is automatically placed on a 90-day medical cooldown.

### 3. Automated Sweeper System (Cron)
- **Expire Overdue**: Any request that passes its required deadline without being fulfilled is marked as `EXPIRED`.
- **Auto-Widen (Radius Expansion)**: `URGENT` or `CRITICAL` requests that fail to find donors within the initial radius automatically expand their search boundaries (e.g., 15km → 30km → 50km) over time to reach more distant donors.

## Technical Stack
- **Backend**: FastAPI, PostgreSQL, PostGIS (for geospatial radius queries), SQLAlchemy, Alembic.
- **Frontend**: React, Vite, Tailwind CSS, Leaflet (Maps).
- **Authentication**: JWT Bearer Tokens.
