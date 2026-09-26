# BloodBridge: System Flow & Architecture

BloodBridge is a real-time, geospatially-aware blood donation network. The system connects Citizens (Donors), Hospitals, Partner Organizations, and System Admins through a unified matching algorithm.

Below is the definitive workflow for each user type.

---

## 1. Citizen / Donor Flow

**Registration & Onboarding:**
- Citizen registers via /citizen/signup.
- **Crucial Step:** They are required to use the interactive map to drop a pin on their **Base Location** (Home/Work). This is permanently saved in the database.
- *Optional:* If REQUIRE_EMAIL_VERIFICATION=true, they receive a JWT token via email to verify their account before logging in.

**Active Browsing (The BloodFeed):**
- Citizen opens the BloodFeed. The browser requests **live GPS coordinates**.
- If granted, the feed queries the backend (/nearby/for-me) using the live coordinates.
- If denied or timed out, it falls back to the **Base Location** stored in the DB.
- PostGIS filters the requests based on (a) Geographic distance (Radius), (b) Medical Blood Type compatibility, and (c) Cooldown periods.

**Creating an Emergency Request:**
- A Citizen can create a Blood Request.
- They set the exact hospital/location map pin and optionally provide the Hospital Name.
- If they specify a registered hospital, the request goes into PENDING_VERIFICATION (waiting for the hospital to approve).
- If they don't, the request goes live immediately (ACTIVE).

**Fulfilling a Request:**
- Citizen sees a compatible request, clicks **Accept**.
- A private chat room is instantly created between the Donor and the Requestor.
- The Donor travels to the location.
- **Verification:** The Requestor provides a QR Code. The Donor scans it to mark the donation as FULFILLED.

---

## 2. Hospital Flow

**Registration & Verification:**
- Hospital registers via the Partner Portal (/partner/signup).
- They enter PENDING state. They cannot act until a System Admin approves them.

**Managing Requests:**
- Once approved, the Hospital accesses their dashboard.
- If a Citizen creates a Blood Request and tags this specific Hospital, it appears in the Hospital's **Pending Verification** queue.
- A doctor/staff member verifies the patient is actually admitted and needs blood, then clicks **Approve**.
- The request instantly becomes ACTIVE and is blasted out to the network via Push Notifications.

---

## 3. Partner Organization (e.g., Al Khidmat Foundation)

**Registration:**
- Registers via the Partner Portal. Approved by Admin.

**Trusted Requests:**
- Organizations are highly trusted entities (NGOs, Blood Banks). 
- When an Organization creates a Blood Request, it bypasses the PENDING_VERIFICATION phase and goes live to the network **immediately**.
- Ideal for mass blood drives or verified NGO-backed patients.

---

## 4. System Admin Flow

**Authentication:**
- Admins do not register. The Admin account is hardcoded into the secure server environment variables (ADMIN_EMAIL, ADMIN_PASSWORD).

**Capabilities:**
- Logs into the Admin Dashboard.
- Views the **System Snapshot** (real-time metrics on total donors, active requests, fulfillment rates).
- Reviews and Approves/Rejects pending Hospitals and Organizations to allow them onto the network.

---

## 5. Background Automation (The Sweeper)

The backend runs an automated scheduler (pscheduler) every 5 minutes:
1. **expire-overdue**: Any active blood request whose 
equired_by deadline has passed without being fulfilled is marked as EXPIRED.
2. **uto-widen**: If an URGENT or CRITICAL request is failing to find matches, the system automatically expands its geographic search radius (e.g., from 15km -> 30km -> 50km) and triggers a new wave of Push Notifications to donors further away.
