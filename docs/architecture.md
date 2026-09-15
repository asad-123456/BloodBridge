# BloodBridge Frontend Architecture & Technical Stack

## 1. Technology Stack

- **Framework:** React 18+ (Vite SPA template)
- **Language:** TypeScript / JavaScript (ESNext)
- **Styling:** Tailwind CSS (configured with BloodBridge red and white tokens)
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **State Management:** Zustand or React Context API (with mock seed data persistence in `localStorage`)
- **Charts / Visuals:** Recharts or lightweight CSS bars for dashboards

---

## 2. Directory Structure

```text
src/
├── assets/
│   ├── bloodbridge-logo.svg / bloodbridge-logo.png
│   └── icons/
├── components/
│   ├── common/
│   │   ├── AppHeader.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── StatCard.tsx
│   │   ├── TrustBadge.tsx
│   │   ├── UrgencyBadge.tsx
│   │   └── UnitProgress.tsx
│   └── ui/                  # shadcn primitives (Button, Table, Dialog, Sheet, Badge, Tabs, etc.)
├── context/
│   └── AppStateContext.tsx  # Central mock data store (requests, users, institutions, flags)
├── layouts/
│   ├── AdminLayout.tsx
│   ├── HospitalLayout.tsx
│   ├── PartnerLayout.tsx
│   └── AuthLayout.tsx
├── pages/
│   ├── admin/
│   │   ├── AdminLogin.tsx
│   │   ├── AdminOverview.tsx
│   │   ├── UserApprovals.tsx
│   │   ├── RequestReview.tsx
│   │   ├── SafetyFlags.tsx
│   │   └── AdminMetrics.tsx
│   ├── hospital/
│   │   ├── HospitalOverview.tsx
│   │   ├── VerificationQueue.tsx
│   │   ├── RequestVerificationDetail.tsx
│   │   └── HospitalHistory.tsx
│   └── partner/
│       ├── PartnerOverview.tsx
│       ├── OpenRequestsFeed.tsx
│       ├── StockFulfillmentDetail.tsx
│       ├── CreateInstitutionRequest.tsx
│       ├── PartnerHistory.tsx
│       └── PartnerProfile.tsx
├── types/
│   └── index.ts             # TypeScript definitions for Request, User, Institution, Flag, AuditEvent
└── utils/
    ├── mockData.ts          # Rich seed data reflecting PRD scenarios
    └── formatters.ts        # Phone masking, date formatters, unit calculations
```
