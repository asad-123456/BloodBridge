# HemaLink Frontend to Backend Handoff

## Current frontend boundary

The frontend is a Vite React SPA. It currently uses `AppStateContext` and `localStorage` as a browser-only mock adapter. Backend integration should replace the context implementation without changing page-level action names or domain types.

## Authentication and authorization

There are three independent portal sessions:

- **Admin:** OTP-authenticated Super Admin. Full platform moderation access.
- **Hospital:** authenticated facility user. Access is limited to requests declared at the user's registered hospital.
- **Partner:** authenticated approved institution user. Access is limited to nearby active requests and the partner's own fulfillment/request history.

The Partner Portal's **Blood requests** feed must return active, incomplete requests from other requesters only. A partner's own institution requests must never appear in its actionable feed; they belong in the partner's History. Both self-verified requests and hospital-verified (`Institution-backed`) requests may appear for external fulfillment.

Partner navigation separates three concepts: **Blood requests** are external opportunities to fulfill, **My requests** are requests created by the partner for its own blood bank, and **History** contains only external requests whose status is `Fulfilled` and whose `fulfilledByInstitutionId` matches the authenticated partner institution.

The frontend expects an authenticated user with `id`, `role`, and optional `institutionId`. The backend must enforce these boundaries server-side; route guards are only a user experience layer.

Portal login uses registered email and password only. Hospital and Partner institution membership is derived from the authenticated user's `institutionId`; there is no institution selector in the login form.

For local demo use only, the seeded accounts are:

- Admin: `sara@hemalink.org` / `Admin@123`
- Central City Hospital: `hamza@centralcityhospital.org` / `Hospital@123`
- Alkhidmat Welfare Centre: `ayesha@alkhidmat.org` / `Partner@123`

These passwords exist only in mock seed data and must be replaced by the backend authentication system.

## Core entities

- `User`: identity, role, phone, active status, and institution membership.
- `Institution`: hospital or partner, address/service area, approval status, and contact.
- `BloodRequest`: blood group, required/fulfilled/remaining units, urgency, required-by timestamp, hospital, lifecycle status, and trust label.
- `FulfillmentRecord`: partner institution claim, units, staff member, handover timestamp, and staff confirmation status.
- `SafetyFlag`: reporter, reported user, category, excerpt, status, and resolution note.
- `AuditEvent`: actor, action, target, timestamp, and note.

Canonical TypeScript shapes are in `frontend/src/types/index.ts`.

## Lifecycle rules

1. Registered-hospital requests begin as `Pending hospital verification` and remain hidden from matching until verified.
2. Hospital verification changes the request to `Active` and `Institution-backed`.
3. A partner claim changes an active request to `Matched / In progress`.
4. A request becomes `Fulfilled` only when `unitsFulfilled === unitsRequired` and the applicable fulfillment handover is staff-confirmed.
5. Partial fulfillment retains a positive `unitsRemaining` value.
6. Rejected hospital verification must include a reason.

## Action contracts

The backend API should provide equivalents for these current mock actions:

- `verifyHospitalRequest(requestId, isVerified, reason)`
- `approveInstitution(institutionId, isApproved, note)`
- `fulfillFromStock(requestId, unitsClaimed)`
- `recordHandover(fulfillmentId)`
- `confirmFulfillment(fulfillmentId)`
- `createInstitutionRequest(requestData)`
- `resolveSafetyFlag(flagId, action, resolutionNote)`
- `updateTrustLabel(requestId, newLabel, reason)`
- `deactivateUser(userId, note)`

Each mutation should return the updated entity plus an audit event, and the UI should invalidate or update the relevant collection after success.

## Privacy and security requirements

- Mask requester and donor phone numbers by default.
- Do not expose direct contact details before the platform's willingness/consent rule is satisfied.
- Enforce institution membership, request ownership, service-area filtering, and admin permissions on the server.
- Treat all browser mock state and client-side role checks as untrusted.

## Integration checklist

- Replace `localStorage` hydration/persistence in `AppStateContext` with API queries and mutations.
- Replace mock email/password acceptance with the production identity provider and credential/session service; add MFA/OTP if required by the deployment policy.
- Preserve facility scoping for hospital queues and detail routes using `hospitalId` and the authenticated user's `institutionId`.
- Preserve partner ownership rules: Blood requests excludes the current institution's own requests; My requests uses institution-created requests; History uses completed requests attributed to that institution.
- Validate fulfillment server-side: only active/in-progress requests with remaining units may be claimed, and the actual claiming institution must be recorded.
- Add loading, error, retry, and optimistic-update rollback states to the existing action surfaces.
- Preserve the current routes and role-specific login entry points.
- Add server pagination/filter parameters for approval, request, flag, audit, and metrics lists.
- Keep audit events append-only and server-generated.
