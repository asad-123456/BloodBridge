# BloodBridge Agent Handoff

## Current Project Location

The project is currently at `D:\HemaLink`. Rename it to `D:\BloodBridge` after closing VS Code and any terminals opened in the project directory. The repository contains:

- `backend/` - FastAPI, SQLAlchemy, Alembic, PostgreSQL/PostGIS API.
- `frontend/` - React, TypeScript, Vite, Tailwind SPA.
- `docs/` - product, design, architecture, backend handoff, and modularization notes.

## Scope Decision

This project is web-only. Do not build or prioritize a mobile application.
The only deliverable is the BloodBridge management system for administrators,
hospitals, and partner institutions. Individual donor/requestor mobile work is
out of scope for this project and should not be added by future agents.

## Local Services

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8001`
- Swagger: `http://localhost:8001/docs`
- PostgreSQL: `localhost:5432`
- Database: `bloodbridge`

PostgreSQL is installed as the Windows service `postgresql-x64-18`. Its data directory is:

```text
C:\productivity\postgresql\data
```

The backend connection string is configured in `backend/.env`. Do not commit that file or expose its secrets in documentation.

## Run Commands

Use two Command Prompt windows:

```cmd
cd /d D:\BloodBridge\backend
D:\BloodBridge\.venv\Scripts\python.exe -m alembic upgrade head
D:\BloodBridge\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

```cmd
cd /d D:\BloodBridge\frontend
npm run dev -- --host 0.0.0.0
```

PowerShell uses `Set-Location` or `cd` without the CMD `/d` switch.

## Authentication and Data Boundaries

- Demo accounts are recognized by their seeded IDs and use `frontend/src/utils/mockData.ts` through `AppStateContext`.
- Demo state is persisted in browser storage and displays `Demo mode` in the authenticated header.
- Permanent admin authentication is handled by FastAPI and returns a JWT.
- Permanent accounts must not load demo users, requests, institutions, flags, audits, or fulfillment records.
- Permanent credentials are configured only in `backend/.env`; never copy them into frontend code or docs.
- Backend admin credentials are hardcoded server configuration, while admin actions operate on PostgreSQL through authorized API routes.
- Permanent-admin institution approvals call `/admin/hospitals/{id}/decision` or `/admin/organizations/{id}/decision` and refresh `/admin/snapshot`; demo approvals remain browser-local.
- Admin user management calls protected `GET /admin/users` or `PATCH /admin/users/{role}/{id}/status`. Status changes are soft deactivation and apply to donors, requestors, hospitals, and organizations.
- Hospital permanent sessions hydrate supported pending requests from `GET /blood-requests/hospital/pending` and verify through `PATCH /blood-requests/{id}/hospital-verify`. Permanent partner sessions hydrate protected live requests, fulfillment history, and inventory without mock fallback.

## Frontend Structure

Each portal now has route-only modules and one page module per tab:

- Admin: `pages/admin/AdminRoutes.tsx` plus overview, registered users, approvals, request review, safety flags, and metrics modules.
- Hospital: `pages/hospital/HospitalRoutes.tsx` plus overview, queue, request detail, and history modules.
- Partner: `pages/partner/PartnerRoutes.tsx` plus overview, open requests, fulfillment detail, create request, my requests, history, and profile modules.

Shared page helpers are kept near each portal. The old consolidated `*Pages.tsx` files were removed.

## Registered Users

The admin Registered Users tab is at `/admin/users`. It supports search, category/status filtering, account detail basics, and disable/re-enable actions. Demo users are shown from mock state and actions persist locally. Permanent admins receive PostgreSQL-backed users through the protected `/admin/users` flow and see loading/error/retry feedback; no mock fallback exists. A paginated endpoint should replace the current list as the dataset grows.

## Remaining Web Release Work

1. Add focused automated tests for authentication, role boundaries, demo/real
	isolation, user status actions, hospital scoping, and partner ownership.
Do not add mobile application work to this list or implement individual-user
web portals.

## Verification

After frontend changes run:

```cmd
cd /d D:\BloodBridge\frontend
npm run build
npm run lint
```

After backend changes run:

```cmd
cd /d D:\BloodBridge\backend
D:\BloodBridge\.venv\Scripts\python.exe -m compileall -q main.py src
D:\BloodBridge\.venv\Scripts\python.exe -m alembic current
```

The Alembic head after the account-status migration is `f4e8c1a2b7d9`.

## Change Log

- 2026-09-15: Added normalized protected admin user listing and soft
	disable/re-enable across all registered account roles.
- 2026-09-15: Added persisted `is_active` columns for hospitals and
	organizations; centralized auth now rejects their inactive sessions.
- 2026-09-15: Connected live Registered Users actions, admin retry feedback,
	hospital pending-request hydration, and hospital verification mutations.
- 2026-09-15: Confirmed demo sessions remain seed/localStorage-backed and show
	Demo mode; permanent sessions do not receive mock collections. Partner live
	collections now use protected PostgreSQL-backed request, fulfillment, and
	inventory endpoints with ownership checks and explicit live loading/errors.
- 2026-09-15: Added protected live admin safety-flag, audit-event, and metrics
	collections, plus persistent flag resolution and fulfillment handover fields.

## Source Documents

- `docs/PRD.md` - product requirements.
- `docs/architecture.md` - technical structure.
- `docs/frontend-backend-handoff.md` - backend contracts and security boundaries.
- `docs/modularization.md` - completed extraction checklist and remaining API/test work.
- `docs/design.md` and `docs/rules.md` - visual and implementation conventions.
