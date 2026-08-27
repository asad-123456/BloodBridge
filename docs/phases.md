# Phased Development Roadmap for HemaLink Frontend

## Phase 1: Setup, Design Tokens & Shell Layouts

- Initialize Vite + React project with Tailwind CSS and Lucide React.
- Configure shadcn/ui components (`button`, `card`, `table`, `dialog`, `badge`, `sheet`, `tabs`, `input`, `textarea`, `dropdown-menu`, `toast`).
- Configure theme colors (`primary: #E10600`, clean white backgrounds `#FFFFFF`, neutral borders `#E2E8F0`).
- Create portal app layouts with the top navigation bar, HemaLink logo, user role switcher, and sidebar navigation.

## Phase 2: Mock Data Store & State Infrastructure

- Construct `mockData.ts` with comprehensive seed data (realistic Karachi/local hospitals, sample requests, users, flagged chats, metrics).
- Implement `AppStateContext.tsx` providing CRUD actions for:
  - Verifying / rejecting hospital requests[cite: 2].
  - Approving / rejecting partner institutions[cite: 2].
  - Claiming request units from partner stock[cite: 2].
  - Creating new institution requests[cite: 2].
  - Resolving safety flags[cite: 2].
  - Updating trust labels[cite: 2].

## Phase 3: Hospital Portal Implementation (`/hospital`)

- Build `HOS-01`: Overview Dashboard with metric widgets and urgent request feed[cite: 1, 2].
- Build `HOS-02`: Verification Queue table with location filters[cite: 1, 2].
- Build `HOS-03`: Detailed Request Verification screen with reason field and decision buttons[cite: 1, 2].
- Build `HOS-04`: Verification History & Institutional Profile view[cite: 1, 2].

## Phase 4: Partner Institution Portal Implementation (`/partner`)

- Build `PAR-01`: Partner Overview Dashboard[cite: 1, 2].
- Build `PAR-02`: Regional Open Requests Feed with "Can fulfill" action triggers[cite: 1, 2].
- Build `PAR-03`: Request Detail & "Declare Stock Available" fulfillment modal[cite: 1, 2].
- Build `PAR-04`: Create Institution Request form with full input validation[cite: 1, 2].
- Build `PAR-05`: Fulfillment & History tracker[cite: 1, 2].
- Build `PAR-06`: Institution Profile & Role Boundary summary[cite: 1, 2].

## Phase 5: Super Admin Portal Implementation (`/admin`)

- Build `ADM-00`: Admin Login / OTP card[cite: 1, 2].
- Build `ADM-01`: Admin Overview Dashboard with visual breakdown bars & audit logs[cite: 1, 2].
- Build `ADM-02`: Users & Institution Approvals table with contextual review drawer[cite: 1, 2].
- Build `ADM-03`: Request & Trust-Label Review pane with lifecycle status updates[cite: 1, 2].
- Build `ADM-04`: Safety Flag Review with chat excerpt inspector and deactivation actions[cite: 1, 2].
- Build `ADM-05`: Analytics, notification outcomes (push stats), and conversion funnel[cite: 1, 2].

## Phase 6: Polish, Responsive Testing & Demo Script

- Add breadcrumbs, interactive toast alerts, and role switcher demo widget.
- Verify full compliance against the PRD acceptance checklist[cite: 2].
