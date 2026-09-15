# Frontend Modularization Plan

## Goal

Refactor the React frontend so each portal tab or workflow has its own page module, while preserving existing routes, visual behavior, role boundaries, and the separation between demo accounts and real backend accounts.

The refactor should be incremental. Each step must leave the application buildable and should avoid changing product behavior unless explicitly required.

## Scope Boundary

BloodBridge is being shipped as a web-only management system. The active
product scope is limited to administrator, hospital, and partner institution
web portals. Do not implement or prioritize a mobile application or individual
user portal in this project.

## Implementation Progress

- [x] Extract admin shared helpers into `AdminShared.tsx`.
- [x] Extract the admin overview page into `AdminOverview.tsx`.
- [x] Extract the registered-users page into `RegisteredUsers.tsx`.
- [x] Extract the safety-flags page into `SafetyFlags.tsx`.
- [x] Extract institution approvals into `InstitutionApprovals.tsx`.
- [x] Extract metrics into `AdminMetrics.tsx`.
- [x] Extract request review into `RequestReview.tsx`.
- [x] Add `AdminRoutes.tsx` for admin-only route declarations.
- [x] Extract hospital portal tabs.
- [x] Add `HospitalRoutes.tsx` for hospital-only route declarations.
- [x] Extract partner portal tabs.
- [x] Add `PartnerRoutes.tsx` for partner-only route declarations.
- [x] Add permanent-admin PostgreSQL snapshot hydration without changing demo state.
- [x] Route permanent-admin institution approval actions through the backend.
- [x] Add protected admin registered-user listing across all account roles.
- [x] Add soft disable/re-enable for donor, requestor, hospital, and partner accounts.
- [x] Add explicit live admin hydration loading, error, and retry states.
- [x] Hydrate supported hospital pending requests and route verification to the API.
- [x] Keep unsupported permanent partner collections explicit and mock-free.
- [x] Add real admin user status actions with persistent PostgreSQL storage.
- [x] Add protected live partner collections and fulfillment mutations.
- [x] Add protected live admin safety flags, audit events, and metrics.
- [ ] Add focused route and workflow tests.

## Current State

The portal tabs have been extracted into dedicated page modules and route-only
modules. Live web data and supported management actions now use the backend and
PostgreSQL; demo accounts remain isolated on mock state. The remaining work is
focused automated testing.

### Change Log

- 2026-09-15: Permanent-admin institution approvals now call the protected
    hospital or organization decision endpoint and refresh PostgreSQL-backed
    state. Demo approvals remain browser-local.
- 2026-09-15: Added protected `/admin/users` status management for all four
    account tables. Disable/re-enable is a soft `is_active` change; hospital
    and organization accounts now persist that flag through a new migration.
- 2026-09-15: Connected Registered Users actions to the live admin API and
    retained browser-local behavior for demo sessions, including active-status
    filtering and confirmation.
- 2026-09-15: Added admin hydration loading/error/retry feedback and connected
    the supported hospital pending-request and verification endpoints. Permanent
    partner sessions now hydrate protected live collections and mutations; no mock
    data is used for them.
- 2026-09-15: Added partner external/own request, fulfillment, handover,
    confirmation, and inventory API support, plus live admin safety flags, audit
    events, and metrics. Added migration `c2f4a8b9d1e0` for moderation and
    handover persistence.
- 2026-09-15: Applied migration `f4e8c1a2b7d9` and verified permanent admin
    login plus `GET /admin/users` against PostgreSQL. The endpoint returned zero
    records because the real database currently has no registered accounts.

## Target Structure

```text
frontend/src/
├── api/
│   ├── client.ts
│   ├── adminApi.ts
│   ├── hospitalApi.ts
│   └── partnerApi.ts
├── components/
│   ├── common/
│   │   ├── AppHeader.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── PageHeader.tsx
│   │   ├── SearchFilterBar.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── EmptyState.tsx
│   └── feature/
│       ├── users/
│       ├── institutions/
│       ├── requests/
│       ├── safety/
│       └── fulfillment/
├── pages/
│   ├── auth/
│   │   └── PortalLogin.tsx
│   ├── admin/
│   │   ├── AdminRoutes.tsx
│   │   ├── AdminOverview.tsx
│   │   ├── RegisteredUsers.tsx
│   │   ├── InstitutionApprovals.tsx
│   │   ├── RequestReview.tsx
│   │   ├── SafetyFlags.tsx
│   │   └── AdminMetrics.tsx
│   ├── hospital/
│   │   ├── HospitalRoutes.tsx
│   │   ├── HospitalOverview.tsx
│   │   ├── VerificationQueue.tsx
│   │   ├── RequestVerificationDetail.tsx
│   │   └── HospitalHistory.tsx
│   └── partner/
│       ├── PartnerRoutes.tsx
│       ├── PartnerOverview.tsx
│       ├── OpenRequestsFeed.tsx
│       ├── StockFulfillmentDetail.tsx
│       ├── CreateInstitutionRequest.tsx
│       ├── MyRequests.tsx
│       ├── PartnerHistory.tsx
│       └── PartnerProfile.tsx
├── context/
│   ├── AuthContext.tsx
│   ├── AppStateContext.tsx
│   └── adapters/
│       ├── demoStateAdapter.ts
│       └── apiStateAdapter.ts
└── types/
    └── index.ts
```

Names may follow existing conventions where a different name is clearer. The important rule is one primary page/workflow per file.

## Module Responsibilities

### Route modules

`AdminRoutes.tsx`, `HospitalRoutes.tsx`, and `PartnerRoutes.tsx` should contain route declarations only. They should not contain business logic or large page implementations.

Routes should remain unchanged:

- `/admin`
- `/admin/users`
- `/admin/approvals`
- `/admin/requests`
- `/admin/flags`
- `/admin/metrics`
- `/hospital`
- `/hospital/queue`
- `/hospital/history`
- `/partner`
- `/partner/open-requests`
- `/partner/create-request`
- `/partner/my-requests`
- `/partner/history`
- `/partner/profile`

### Page modules

Each page owns its page-specific loading, filtering, empty states, actions, and layout composition. A page may use feature components, context actions, or an API hook, but should not decide another page's route.

### Shared components

Move repeated presentation into shared components only when it is used by more than one page. Examples include page headers, search/filter controls, confirmation dialogs, status badges, empty states, and tables.

Avoid creating generic abstractions for one page. Keep feature-specific components under a feature folder, such as `components/feature/users/`.

### API and state adapters

Keep page-level action names stable while the data source changes behind an adapter:

- Demo accounts use seeded mock data and browser-local persistence.
- Real accounts use authenticated API requests and server-generated data.
- Pages must not import seed data directly.
- API clients must attach the current bearer token and handle unauthorized responses.

## Demo and Real Account Separation

This boundary is required throughout the refactor:

1. Demo accounts are identified explicitly by auth state.
2. Demo accounts load only `mockData.ts` through the demo adapter.
3. Demo sessions display a visible `Demo mode` indicator.
4. Permanent accounts never load mock users, requests, institutions, flags, audits, or fulfillment records.
5. Permanent account actions must call backend endpoints and update or invalidate API data.
6. Switching accounts must remount or reset the active data adapter so demo data cannot leak into a real session.
7. Mock localStorage keys must not be used as a fallback for real accounts.

## Admin Registered Users Page

The registered-users page should be a standalone module at `pages/admin/RegisteredUsers.tsx`.

It should provide:

- Search by name or email.
- Category filter: All, Individuals, Partner institutions, Hospitals.
- Active/inactive filter.
- Account detail view.
- Disable account action with confirmation.
- Re-enable account action where supported.
- Remove account action only when the backend defines a safe deletion policy; otherwise use soft deletion/deactivation.
- Success and error feedback.
- Demo data behavior only for demo admin sessions.

The backend should eventually expose a paginated admin endpoint for registered users. The endpoint must enforce admin authorization and return a normalized shape that can be mapped to the frontend `User` type. User deletion should be treated as a destructive operation and should preserve audit history where possible.

## Refactor Sequence

### Step 1: Extract shared primitives

Create or consolidate `PageHeader`, `EmptyState`, `SearchFilterBar`, and `ConfirmDialog`. Preserve the current Tailwind styling and text. Do not redesign the portals during this refactor.

### Step 2: Extract admin pages

Move the current admin functions into:

1. `AdminOverview.tsx`
2. `RegisteredUsers.tsx`
3. `InstitutionApprovals.tsx`
4. `RequestReview.tsx`
5. `SafetyFlags.tsx`
6. `AdminMetrics.tsx`

Create `AdminRoutes.tsx` and update the app shell to use it. Remove route switching from `AdminPages.tsx`, or retain it temporarily as a compatibility wrapper during the migration.

### Step 3: Extract hospital pages

Move overview, verification queue, request detail, and history into separate modules. Keep facility scoping based on the authenticated user's institution membership.

### Step 4: Extract partner pages

Move overview, external requests, fulfillment detail, create request, my requests, history, and profile into separate modules. Preserve the rule that a partner's own requests do not appear in the external fulfillment feed.

### Step 5: Introduce page-level data hooks

Where useful, add focused hooks such as:

- `useAdminUsers`
- `useInstitutionApprovals`
- `useHospitalQueue`
- `usePartnerRequests`
- `useFulfillments`

Hooks should own data loading, mutation calls, loading state, error state, and invalidation. Pages should focus on composition and interaction.

### Step 6: Complete backend-backed collections

The permanent admin now hydrates users, institutions, and requests from the
protected `/admin/snapshot` endpoint. The remaining work is to replace the
placeholder empty collections for hospital and partner sessions with focused
API queries and mutations.

### Change Log

- 2026-09-15: Added protected admin snapshot hydration. Permanent admin reads
    PostgreSQL-backed users, institutions, and requests; demo accounts continue
    using seeded mock state and browser persistence.
- 2026-09-15: Began separating permanent-admin mutations. Institution approval
    is the next mutation slice; demo approval behavior remains local-only until
    the backend call is selected by auth mode.

Add the backend endpoints needed by real pages, beginning with admin users. Prefer paginated endpoints with server-side filtering and sorting. Keep authorization, institution membership, audit generation, and soft deletion on the server.

### Step 7: Remove compatibility code

After all pages use the new modules and validation passes, delete obsolete consolidated page implementations and unused imports. Do not remove mock data; retain it for demo accounts only.

## Testing and Validation

After each extraction:

- Run `npm run build`.
- Run `npm run lint`.
- Verify every existing route loads.
- Verify direct navigation and browser refresh work.
- Verify demo login displays `Demo mode` and shows seeded data.
- Verify permanent admin login does not show seeded data.
- Verify switching between demo and permanent accounts does not leak data.
- Verify destructive account actions require confirmation.
- Verify API failures show an actionable error state.

For the completed refactor, add focused tests for:

- Route rendering.
- User category filtering.
- Demo/real adapter selection.
- Account deactivation behavior.
- Partner ownership filtering.
- Hospital institution scoping.

## Acceptance Criteria

The modularization is complete when:

- Each portal tab has a dedicated page module.
- Route files contain routing rather than page implementations.
- Shared components are reused without hiding page-specific behavior.
- Demo and real data paths are explicitly separated.
- Permanent admin actions are server-authorized and auditable.
- Registered users can be searched, categorized, filtered, and safely disabled.
- Existing URLs and visible workflows continue to work.
- Build, lint, and focused workflow checks pass.
