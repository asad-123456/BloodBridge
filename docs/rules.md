### rules.md

```markdown
# Frontend Implementation & Design Rules

## 1. Domain & Scope Rules

1. **Frontend Only:** Never generate backend endpoints, database migrations, or server handlers. Everything must run fully in the browser with mock stores[cite: 2].
2. **Hospital Role Boundary:** The Hospital Portal MUST NEVER show stock management or fulfillment actions[cite: 2]. It only permits `Verify` and `Not Verified` decisions on requests declared at that hospital[cite: 2].
3. **Partner Role Boundary:** Partner Institutions can declare stock availability and fulfill requests[cite: 2]. They DO NOT have an ERP/lot-tracking ledger—fulfillment is a simple declaration[cite: 2].
4. **Privacy & Masking:** Requester and donor phone numbers must be masked by default (e.g., `+92 *** *** 219`) until willingness is reached[cite: 2].
5. **Unit-Level Completion:** A request is only `Fulfilled` when `unitsFulfilled === unitsRequired`[cite: 2]. Partial claims keep the request in `Matched / In progress` with active `unitsRemaining`[cite: 2].

---

## 2. Code Quality & Component Conventions

1. **Component Modularity:** Reuse common widgets (`StatCard`, `TrustBadge`, `UrgencyBadge`, `AppSidebar`, `AppHeader`, `DataTable`).
2. **Shadcn Primitives:** Leverage standard shadcn/Radix components for dialogs, popovers, dropdowns, sheets, and tables.
3. **Tailwind Best Practices:** Use utility classes cleanly. Adhere strictly to the design token palette (HemaLink Red `#E10600` / `#C80000`, slate neutrals, pure white cards).
4. **Interactive Mock Feedback:** Every primary button (`Approve`, `Verify`, `Can Fulfill`, `Publish Request`, `Resolve Flag`) must trigger immediate visual state changes in the UI (toasts, badge updates, table row status changes).
```
