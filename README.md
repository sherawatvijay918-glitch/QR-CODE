# Hotel QR Ordering — Admin Dashboard (Phase 1)

Next.js 15 (App Router) + TypeScript + Tailwind CSS dashboard for the
Hotel QR Ordering & Admin System, built from the requirement doc. This
phase covers the **staff-facing side only** (Admin, Manager, Kitchen,
Waiter) with realistic dummy data — no backend yet.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/login`.

## What's included

- **Role-based login (dummy)** — pick Admin / Manager / Kitchen / Waiter
  on the login screen, no password needed yet. Role is stored in
  `localStorage` for the session.
- **Admin Overview** — today's revenue, pending/preparing/delivered
  counts, 7-day revenue chart, room/table occupancy, live orders table.
- **Orders** — filterable list of every order as a KOT-style ticket
  card (source, items, instructions, status, total).
- **Rooms** & **Tables** — status, QR reference, orders-today count,
  add/print QR actions (UI only for now).
- **Menu** — categories + items grid, veg/non-veg markers,
  availability toggle look, add/edit/delete actions (UI only).
- **Reports** — daily order trend, revenue split by room vs. table,
  top-selling items.
- **Staff** — role list for Admin/Manager/Kitchen/Waiter accounts.
- **Kitchen Panel** — live KOT board (New → Preparing → Ready) with
  working status-advance buttons.
- **Waiter Panel** — ready-to-serve queue with a working "Mark
  Delivered" action.
- Light/dark theme toggle, role-aware sidebar navigation.

All data lives in `src/lib/dummy-data.ts` — edit it to try different
scenarios, or wire it up to a real API in Phase 2.

## Folder structure

```
src/
  app/
    layout.tsx              # fonts, theme provider, auth provider
    page.tsx                 # redirects to /login
    login/page.tsx           # role-based demo login
    dashboard/
      layout.tsx             # auth guard + sidebar/topbar shell
      page.tsx                # Overview
      orders/page.tsx
      rooms/page.tsx
      tables/page.tsx
      menu/page.tsx
      reports/page.tsx
      staff/page.tsx
      kitchen/page.tsx
      waiter/page.tsx
  components/
    Sidebar.tsx, Topbar.tsx, StatCard.tsx, StatusBadge.tsx,
    VegDot.tsx, ThemeToggle.tsx
  lib/
    types.ts                 # shared TS types
    dummy-data.ts             # all mock data
    auth-context.tsx          # dummy role-based auth (Context + localStorage)
```

## Phase 2 (suggested next steps)

- Real backend: MySQL + Prisma + JWT (matches your other projects'
  stack) or Node/Express per the requirement doc.
- Real-time order push with Socket.IO instead of static dummy state.
- QR code generation per room/table (`qrcode` npm package) + printable
  labels.
- The **customer-facing ordering site** (scan → menu → cart → order),
  which this phase does not include — it's a separate, public-facing
  Next.js app that would hit the same backend.
- Auth: replace localStorage demo login with NextAuth/JWT-based
  sessions and hashed passwords per role.
- Housekeeping/towel requests, online payment, POS billing, inventory,
  and feedback — listed as "Future Features" in the requirement doc.
