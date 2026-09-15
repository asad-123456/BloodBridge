# Product Requirements Document (PRD) - BloodBridge Frontend Web Portals

## 1. Project Overview & Scope Guardrails

BloodBridge is a web-only management system for the blood donor matching
network operated by Alkhidmat Foundation[cite: 2]. The deliverable includes
the React/Vite web interface and its FastAPI/PostgreSQL backend. Individual
donor and requestor mobile applications are outside this project's scope.
Real web workflows must use the backend and PostgreSQL; demo accounts may use
the explicitly separated mock state described in `docs/agent-handoff.md`.

The scope consists strictly of the three desktop web stakeholder portals designed in Penpot[cite: 1]:

1. **Admin Portal** (`/admin/*`)[cite: 1]
2. **Hospital Portal** (`/hospital/*`)[cite: 1]
3. **Partner Institution Portal** (`/partner/*`)[cite: 1]

---

## 2. Stakeholder Roles & Responsibilities

### 2.1 Super Admin (Platform Health & Trust)

- **Institution Approvals:** Review and approve/reject registering Hospitals and Partner Institutions[cite: 2].
- **Request & Trust-Label Moderation:** Audit blood requests and manage trust labels (`Self-verified`, `Institution-backed`, `Partner fulfillment`)[cite: 2].
- **Safety Moderation:** Resolve user, chat, and request flags manually, with account deactivation capabilities[cite: 2].
- **Observability & Metrics:** Track platform KPIs (active requests, match rates, response times, unit fulfillment rates, and push delivery breakdown: Delivered, Failed, Unknown/Offline)[cite: 2].

### 2.2 Hospital (Location-Tied Request Verification ONLY)

- **Location Queue:** View incoming blood requests tied exclusively to the hospital's specific facility location[cite: 2].
- **Verification Gating:** Submit a **Verified** decision (releasing the request to `Active` + `Institution-backed` for donor matching) or **Not Verified** with a mandatory reason note[cite: 2].
- **Strict Boundary:** Hospitals do NOT manage stock or fulfill requests[cite: 2].

### 2.3 Partner Institution (Blood Banks & Alkhidmat Welfare Hubs)

- **Stock Fulfillment:** Browse nearby open `Active` requests within its service area and declare fulfillment from available stock on a first-to-respond basis[cite: 2].
- **Institution Requests:** Create institution-backed blood requests when stock is low or during high emergency demand[cite: 2].
- **Fulfillment Tracking:** Confirm handovers, record staff confirmations, and update unit-level progress (`Units Fulfilled` vs. `Units Required`) without complex inventory ledgers[cite: 2].

---

## 3. Screen Inventory & Required Views

### Admin Portal (`/admin`)

- `ADM-00`: Admin Login / OTP Authentication screen.
- `ADM-01`: Overview Dashboard (KPI cards, request status bars, action queues, admin audit log table)[cite: 1, 2].
- `ADM-02`: Users & Institution Approvals (search/filter tabs, user table, institution detail/approval pane)[cite: 1, 2].
- `ADM-03`: Requests & Trust-Label Review (filterable request table, lifecycle state summary, metadata editor pane)[cite: 1, 2].
- `ADM-04`: Safety Flag Review (flag counts, queue list, reported content review, resolution controls)[cite: 1, 2].
- `ADM-05`: Metrics & Notification Outcomes (date/area filters, 8-KPI grid, push delivery stats, conversion funnel)[cite: 1, 2].

### Hospital Portal (`/hospital`)

- `HOS-01`: Hospital Overview (pending/verified counters, urgent requests needing attention, role disclaimer)[cite: 1, 2].
- `HOS-02`: Verification Queue (location-locked request table, urgency badges, review action buttons)[cite: 1, 2].
- `HOS-03`: Request Verification Detail (masked requester ID, unit breakdown, reason field, Verify / Not Verify actions)[cite: 1, 2].
- `HOS-04`: Verification History & Profile (historical audit log table, approval status badge, facility profile)[cite: 1, 2].

### Partner Institution Portal (`/partner`)

- `PAR-01`: Partner Overview (open requests nearby, active claims, stock fulfillment role disclaimer)[cite: 1, 2].
- `PAR-02`: Open Requests Feed (service-area filtered feed table with "Can fulfill" quick actions)[cite: 1, 2].
- `PAR-03`: Request Detail & Stock Fulfillment (unit progress, distance tag, "Declare Stock Available" form)[cite: 1, 2].
- `PAR-04`: Create Institution Request Form (blood group, units required, urgency, required-by, consent checkbox)[cite: 1, 2].
- `PAR-05`: Fulfillment & Request History (combined claims and own-request audit table)[cite: 1, 2].
- `PAR-06`: Institution Profile & Boundaries (institutional settings, verification badge, role boundary checklist)[cite: 1, 2].

---

## 4. Lifecycle & State Machine Reference

Requests must strictly follow the PRD state machine[cite: 2]:

1. `Draft`[cite: 2]
2. `Pending hospital verification` (if declared hospital is registered; hidden from donors)[cite: 2]
3. `Active` (visible to matching pool; marked `Self-verified` or `Institution-backed`)[cite: 2]
4. `Matched / In progress` (at least 1 donor accepted or partner claimed stock; remains until `Units Fulfilled` == `Units Required`)[cite: 2]
5. `Fulfilled` (all units confirmed)[cite: 2]
6. `Closed` / `Cancelled` / `Expired`[cite: 2]
