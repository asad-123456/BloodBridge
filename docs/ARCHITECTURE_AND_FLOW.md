# BloodBridge Architecture & Flow Logic

This document details the complete end-to-end flow of the BloodBridge platform, outlining the underlying logic, user journeys, geospatial constraints, and security principles.

## Core System Entities

The platform consists of four primary user roles, unified under the `users` (previously specific entity tables) and authenticated via JWT:

1. **Citizens (Donors / Requestors)**
   - Represented by the `donors` table. 
   - Can create blood requests and commit to donating for others.
   - Tied to a specific geographic `location` (latitude/longitude) stored in PostGIS.

2. **Hospitals (Verification & Reception)**
   - Represented by the `hospitals` table.
   - Act as the trusted medical authority. They must verify all citizen-created blood requests before the request becomes visible to the wider donor network.
   - Staffed by hospital administrators.

3. **Organizations (Blood Banks & Partners)**
   - Represented by the `organizations` table.
   - Act as institutional backups. If a request cannot be fulfilled by citizens, an organization can dip into their physical inventory to fulfill the request.

4. **Admins (System Overseers)**
   - Review and approve new Hospital and Organization registrations.
   - Monitor system metrics and safety flags.

## User Journey & Logic Flow

### 1. Creating a Blood Request
- **Action:** A citizen uses the `CreateRequest` portal to declare a medical need.
- **Constraints:**
  - They must specify the blood type, urgency, required units, and the target hospital.
  - **Time Constraint:** The `required_by` time MUST be at least 15 minutes in the future (enforced by the `RequiredByDatetime` validator on the backend, and by strict `<input type="datetime-local">` minimums on the frontend).
  - **Geospatial Constraint:** They drop a pin on a Leaflet map. This translates to PostGIS `GeographyPoint` coordinates in the backend.
- **State Transition:** The request enters the `PENDING_HOSPITAL_VERIFICATION` state. It is not yet visible to other citizens.

### 2. Hospital Verification
- **Action:** The selected Hospital receives a notification in their Verification Queue.
- **Logic:** The hospital verifies the patient's identity and medical necessity.
- **State Transition:** If approved, the request state moves to `ACTIVE`.

### 3. Geospatial Matching & The Blood Feed
- **Action:** Citizens logging into the BloodFeed see a live map of active requests.
- **Logic:**
  - The frontend sends the citizen's current viewport/pin location to the backend (`/blood-requests/nearby/for-me`).
  - The backend utilizes PostGIS `ST_DWithin` to calculate the spatial distance between the citizen's location and active requests, returning only those within a 50km radius.
  - The backend cross-references the citizen's blood type (handling universal donors like O- where appropriate) and returns compatible matches.

### 4. Committing to Donate (Request Matches)
- **Action:** A citizen clicks "Commit to Donate".
- **Logic:**
  - The backend creates a `RequestMatch` record with status `PENDING`.
  - An atomic SQL lock (`UPDATE blood_requests SET units_secured = units_secured + 1`) ensures that multiple users cannot over-commit and exceed the `units_needed`.
  - If `units_secured == units_needed`, the request transitions from `ACTIVE` to `PARTIALLY_MATCHED`.

### 5. Fulfillment & Completion
- **Action:** The citizen physically goes to the hospital and donates. The hospital logs into their portal and marks the match as "Completed".
- **Logic:**
  - The `RequestMatch` is updated to `COMPLETED`.
  - The backend triggers `mark_fulfilled_if_complete()`. It checks if all required units are officially completed (and no matches are left pending).
  - If satisfied, the Blood Request is finalized as `FULFILLED`.

## Security & Concurrency

- **Atomic Transactions:** Because emergencies can result in rapid, overlapping commitments, `atomic_reserve_units` is used in SQLAlchemy. By relying on native Postgres `UPDATE` locks rather than application-side counters, the system prevents race conditions.
- **Data Serialization:** PostGIS `Geography` blobs are stripped from direct JSON payloads. Instead, SQLAlchemy `@property` methods utilizing `geoalchemy2.shape.to_shape` dynamically convert binary geometries into readable `latitude` and `longitude` floats.


## Time Constraints & Expiration Logic

Time-sensitive data in BloodBridge is strictly governed to prevent stale emergency requests from cluttering the system.

### 1. Blood Request Expiration
- **Lifetime:** A Blood Request remains active only until its exact `required_by` timestamp is reached.
- **Minimum Future Buffer:** When a citizen creates a request, the `required_by` time is enforced to be at least **15 minutes in the future** from creation time (enforced both in frontend UI forms and backend `RequiredByDatetime` Pydantic validators).
- **The Sweep Scheduler:** A background APScheduler job (`utils/scheduler.py`) runs every `SWEEP_INTERVAL_MINUTES` (default: 1 minute). 
- **Expiration Trigger:** The scheduler calls `expire_overdue_requests`, which scans for any request where `required_by < now()`.
- **Match Cancellation:** When a request expires, its status changes to `EXPIRED`. Crucially, any open `RequestMatch` commitments (i.e. donors who said they were coming but never arrived or the hospital didn't confirm) are forcefully marked as `CANCELLED` with the reason: *"Request expired before it was fulfilled"*.

### 2. Auto-Widening (Geospatial Expansion)
- The same scheduler sweeps for stale requests that are not yet fulfilled. 
- Using `auto_widen_stale_requests`, if a request has been active for too long without enough donors, its geospatial search radius is automatically expanded to alert donors further away.

### 3. Authentication Expiration
- JWT Access Tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES` (configurable in `.env`).
- Password Reset/Verification tokens are short-lived and expire according to `EMAIL_TOKEN_EXPIRE_MINUTES`.
