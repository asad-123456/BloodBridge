# Design System & UI Specifications

## 1. Visual Brand & Theme (HemaLink Aesthetic)

- **Primary Brand Color:** HemaLink Crimson Red (`#E10600` / `#DC2626`)
- **Primary Hover/Dark:** Deep Blood Red (`#B91C1C` / `#991B1B`)
- **Primary Subtle / Tint:** Crimson Light Tint (`#FEF2F2`)
- **Background:** Crisp Off-White / Gray 50 (`#F8FAFC` / `#FFFFFF`)
- **Card Surfaces:** Pure White (`#FFFFFF`) with subtle border (`border-slate-200`) and soft shadow (`shadow-sm`)
- **Typography:** Inter / Clean Sans-serif with high legibility

---

## 2. Color Palette Tokens

| Token            | Hex Code                          | Purpose                                                                 |
| :--------------- | :-------------------------------- | :---------------------------------------------------------------------- |
| `primary`        | `#E10600`                         | Logo, primary action buttons, active navigation states, critical badges |
| `primary-hover`  | `#C80000`                         | Button hover states                                                     |
| `primary-light`  | `#FEE2E2`                         | Selected rows, highlight backgrounds                                    |
| `bg-app`         | `#F8FAFC`                         | Page background                                                         |
| `surface-card`   | `#FFFFFF`                         | Panels, tables, modal bodies                                            |
| `border-subtle`  | `#E2E8F0`                         | Dividers, card borders, table lines                                     |
| `text-main`      | `#0F172A`                         | Headings, primary cell values                                           |
| `text-muted`     | `#64748B`                         | Labels, subtitles, masked phone text                                    |
| `badge-urgent`   | `#DC2626` (text) / `#FEE2E2` (bg) | High urgency blood requests                                             |
| `badge-verified` | `#16A34A` (text) / `#DCFCE7` (bg) | Institution-backed / Verified requests                                  |
| `badge-pending`  | `#D97706` (text) / `#FEF3C7` (bg) | Pending verification / review                                           |

---

## 3. UI Component Specifications

### 3.1 App Header & Branding

- Displays the **HemaLink logo** (Red droplet glyph + bold typography) on the top-left.
- Right section features a **Portal Switcher Dropdown** (`Admin Portal`, `Hospital Portal`, `Partner Portal`) for easy evaluator demonstrations, user profile avatar, and notifications bell.

### 3.2 Sidebar Navigation

- Vertical sticky sidebar with clean icon + label menu items.
- Active route highlighted with a light red pill background (`bg-red-50 text-red-600 font-semibold border-r-2 border-red-600`).

### 3.3 Status & Trust Badges

- **Trust Labels:**
  - `Self-verified`: Slate outline badge with neutral gray text[cite: 2].
  - `Institution-backed`: Green badge with hospital/check icon[cite: 2].
  - `Partner fulfillment`: Blue badge indicating stock claim[cite: 2].
- **Urgency Tags:**
  - `Urgent` (Red pill), `Today` (Amber pill), `Routine` (Blue/Gray pill)[cite: 2].
