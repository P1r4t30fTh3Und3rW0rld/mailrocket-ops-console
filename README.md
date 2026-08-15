# MailRocket Ops Console

# Lovable prompt — MailRocket Ops Console UI

Copy everything below the line into Lovable.dev.

---

## Project brief

Build a **React + TypeScript + Vite + Tailwind CSS** internal operator console called **MailRocket Ops**.

This is **not** a customer product UI. It is a private ops tool for the MailRocket founder to:

- find customer accounts fast
- judge reputation risk
- restrict / suspend sending
- review billing / quota issues
- see platform health
- read an audit trail of privileged actions

Ship a **complete, polished UI with realistic mock data** and a thin API client layer so we can later wire it to a real backend. Prefer clean components over gimmicks.

**Stack preferences**

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 if possible (v3 OK)
- React Router (or TanStack Router)
- Lucide icons
- Recharts for small charts
- No auth provider SaaS, no Supabase, no fake multi-tenant SaaS boilerplate
- No purple gradient “AI startup” look
- No Inter / Roboto / Arial as primary fonts

---

## Brand & design language (match MailRocket customer dashboard)

MailRocket’s customer dashboard already uses this system. **Match it closely** so ops feels like the same product family, but slightly more utilitarian (denser tables, stronger status colors, fewer marketing flourishes).

### Typography

- **Sans:** Geist (fallback: `ui-sans-serif, system-ui, sans-serif`)
- **Mono:** Geist Mono (IDs, API key prefixes, email IDs, JSON)
- Load Geist from a CDN or local font files
- Page titles: semibold, tight tracking
- Body: readable, not oversized; ops UI should feel compact

### Color system (oklch — use these exact tokens)

Light mode (`:root`):

```css
--radius: 0.5rem;
--background: oklch(0.985 0.003 106);
--foreground: oklch(0.18 0.006 106);
--card: oklch(1 0 0);
--card-foreground: oklch(0.18 0.006 106);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.18 0.006 106);
--primary: oklch(0.24 0.01 160);
--primary-foreground: oklch(0.98 0.01 160);
--secondary: oklch(0.96 0.004 106);
--secondary-foreground: oklch(0.24 0.006 106);
--muted: oklch(0.96 0.004 106);
--muted-foreground: oklch(0.52 0.008 106);
--accent: oklch(0.95 0.03 165);
--accent-foreground: oklch(0.3 0.05 165);
--destructive: oklch(0.55 0.19 25);
--destructive-foreground: oklch(0.99 0 0);
--border: oklch(0.912 0.004 106);
--input: oklch(0.912 0.004 106);
--ring: oklch(0.62 0.11 168);
--brand: oklch(0.66 0.13 168);          /* teal / mint brand */
--brand-foreground: oklch(0.18 0.02 168);
--success: oklch(0.62 0.13 160);
--warning: oklch(0.74 0.14 78);
--info: oklch(0.62 0.1 240);
--surface: oklch(0.975 0.003 106);
--elevated: oklch(1 0 0);
--sidebar: oklch(0.975 0.003 106);
--sidebar-foreground: oklch(0.28 0.006 106);
--sidebar-primary: oklch(0.24 0.01 160);
--sidebar-primary-foreground: oklch(0.98 0.01 160);
--sidebar-accent: oklch(0.94 0.005 106);
--sidebar-accent-foreground: oklch(0.2 0.006 106);
--sidebar-border: oklch(0.912 0.004 106);
--chart-1: oklch(0.66 0.13 168);
--chart-2: oklch(0.62 0.1 240);
--chart-3: oklch(0.74 0.14 78);
--chart-4: oklch(0.55 0.19 25);
--chart-5: oklch(0.5 0.02 106);
```

Dark mode (`.dark`) — **default theme for ops** (operators often work late; dark reduces glare):

```css
--background: oklch(0.16 0.004 106);
--foreground: oklch(0.96 0.003 106);
--card: oklch(0.196 0.004 106);
--card-foreground: oklch(0.96 0.003 106);
--popover: oklch(0.21 0.004 106);
--popover-foreground: oklch(0.96 0.003 106);
--primary: oklch(0.96 0.003 106);
--primary-foreground: oklch(0.18 0.004 106);
--secondary: oklch(0.25 0.004 106);
--secondary-foreground: oklch(0.95 0.003 106);
--muted: oklch(0.25 0.004 106);
--muted-foreground: oklch(0.68 0.006 106);
--accent: oklch(0.28 0.02 168);
--accent-foreground: oklch(0.92 0.05 168);
--destructive: oklch(0.62 0.17 25);
--destructive-foreground: oklch(0.98 0 0);
--border: oklch(1 0 0 / 9%);
--input: oklch(1 0 0 / 12%);
--ring: oklch(0.7 0.12 168);
--brand: oklch(0.78 0.15 168);
--brand-foreground: oklch(0.16 0.02 168);
--success: oklch(0.75 0.14 160);
--warning: oklch(0.8 0.14 78);
--info: oklch(0.7 0.11 240);
--surface: oklch(0.19 0.004 106);
--elevated: oklch(0.23 0.004 106);
--sidebar: oklch(0.145 0.004 106);
--sidebar-foreground: oklch(0.88 0.003 106);
--sidebar-primary: oklch(0.78 0.15 168);
--sidebar-primary-foreground: oklch(0.16 0.02 168);
--sidebar-accent: oklch(0.24 0.004 106);
--sidebar-accent-foreground: oklch(0.96 0.003 106);
--sidebar-border: oklch(1 0 0 / 8%);
--chart-1: oklch(0.78 0.15 168);
--chart-2: oklch(0.7 0.11 240);
--chart-3: oklch(0.8 0.14 78);
--chart-4: oklch(0.62 0.17 25);
--chart-5: oklch(0.6 0.01 106);
```

### Visual rules

- Radius: `0.5rem` base (not pill-heavy)
- Borders: subtle hairlines; avoid heavy multi-layer shadows
- Brand accent: **teal/mint** (`--brand`), not purple/indigo
- Background: warm-neutral gray (hue ~106), not pure black / cream / purple wash
- Status badges:
  - `active` → success green
  - `restricted` → warning amber
  - `suspended` → destructive red
- Prefer tables + dense detail panels over big marketing cards
- Cards OK for metric strips and action confirm dialogs only
- Light/dark toggle in header (default dark)
- Logo mark: simple rocket / “MR” wordmark in brand teal; text **MailRocket Ops** (with small “Internal” muted label)

### Layout chrome

- Left sidebar (collapsible), top header with search shortcut hint (`⌘K` / `Ctrl+K`)
- Content max width comfortable for tables (~1400px), not a narrow marketing column
- Sticky table headers
- Empty / loading / error states for every list

---

## Product context (for copy & IA)

MailRocket is an API-first email delivery platform (Resend/Postmark-class) on Amazon SES, India-first (`ap-south-1`).

**Customer dashboard** = `app.mailrocket.in` (developers send mail, manage domains/keys).

**This Ops console** = internal only. Never link to customer dashboard. Never pretend to be public SaaS pricing/marketing.

Account statuses:

- `active` — normal sending
- `restricted` — block **new** sends; customer can still log into their dashboard
- `suspended` — full freeze

Privileged actions always require a **reason** string and a confirm dialog.

---

## Navigation (sidebar)

1. **Overview** — platform pulse
2. **Accounts** — default home for day-to-day work
3. **Deliverability** — accounts over bounce/complaint thresholds
4. **Users** — global user search
5. **Billing** — over-quota / failed payments / plan tools
6. **Platform** — queues, lag, accept-path errors
7. **Audit** — global privileged action log
8. **Settings** — operator profile, theme, mock API base URL

---

## Screens to build (detailed)

### 0) Login (`/login`)

- Centered card on dark surface
- Title: “MailRocket Ops”
- Subtitle: “Internal operator access”
- Fields: Email, Password
- Primary button: Sign in
- Footer note: “Access via SSH tunnel only. Not a public site.”
- Error toast/banner for invalid credentials
- After login → `/accounts`

Mock: accept any email + password length ≥ 8, store a fake JWT in `localStorage` key `mr_ops_token`.

### 1) Overview (`/`)

Top KPI strip (4–6 tiles):

- Accounts total / restricted / suspended
- Emails accepted last 24h
- Platform bounce % (mock)
- Platform complaint % (mock)
- SQS send queue depth
- DLQ depth (highlight red if > 0)

Below:

- **Needs attention** list (deliverability + billing alerts) — clickable rows
- Small sparkline / bar chart: accepts last 7 days
- Recent audit events (last 8)

### 2) Accounts list (`/accounts`) — PRIMARY SCREEN

Header: “Accounts” + search input.

Search placeholder: `Search email, workspace, account id, domain, key prefix…`

Table columns:

| Column | Notes |
| --- | --- |
| Workspace | account name |
| Owner | email |
| Plan | e.g. free / growth / scale |
| Created | relative + absolute on hover |
| Sent 7d | number |
| Bounce % | color warn/danger thresholds |
| Complaint % | color warn/danger |
| Quota | `used / limit` with thin progress |
| Status | badge |
| Region | `in` |

Row click → `/accounts/:id`

Filters (chips or select): Status All/Active/Restricted/Suspended, Plan

Mock ~12 realistic Indian/startup accounts (domains like `acme.in`, `paylocal.io`, etc.).

### 3) Account detail (`/accounts/:id`) — MOST IMPORTANT SCREEN

Sticky header:

- Workspace name
- Status badge
- Account UUID (mono, copy button)
- Actions: **Restrict** / **Suspend** / **Unsuspend** (destructive variants as needed)
- Opening an action opens a modal: required Reason textarea + Confirm

Tabs or stacked sections:

**A. Identity**

- Owner name/email
- `data_region`
- Created at
- Teams list
- Members table (email, name, role)

**B. Reputation strip (prominent)**

- Bounce rate / Complaint rate with thresholds
  - Warn: bounce ≥ 5%, complaint ≥ 0.08%
  - Danger: bounce ≥ 10%, complaint ≥ 0.1%
- Sparkline last 14 days (mock)
- CTA “Open in Deliverability queue” if over threshold

**C. Usage**

- Toggle 24h / 7d / 30d
- Metrics: sent, delivered, bounced, complained, suppressed, opened, clicked
- Simple volume chart

**D. Domains**

- Table: domain, verify status, sending enabled

**E. API keys**

- name, prefix `mr_…`, created, last used, revoked?
- Revoke button (confirm + reason) — UI only for now

**F. Billing**

- Plan, status, period end
- Quota used / limit
- Failed invoices list (mock)
- Buttons: Override quota (modal: new limit, expiry, reason), Change plan (modal)

**G. Recent emails**

- Table: email id, to, subject, status, created
- Click row → side drawer with fake event timeline

**H. Audit for this account**

- Timeline/table: when, actor, action, reason, before→after summary

### 4) Deliverability queue (`/deliverability`)

Daily review list of accounts that crossed warn/restrict thresholds in last 24h.

Columns: workspace, owner, bounce%, complaint%, sent 24h, suggested action, status

Row actions: Restrict (modal+reason), Mark reviewed, Whitelist until (date)

Empty state: “No reputation risks right now.”

### 5) Users (`/users`)

Search by email.

Results: user email, name, teams/accounts membership, last login, status.

Actions (UI only): Disable login, Force password reset.  
Show Impersonate button as **disabled** with tooltip “Coming later — heavily audited”.

### 6) Billing ops (`/billing`)

Three sections:

1. Over quota / grace accounts
2. Failed Razorpay payments
3. Recent plan / credit changes (mock audit)

Actions: Set plan, Add complimentary credits — both require reason modal.

### 7) Platform health (`/platform`)

Cards/tables:

- SQS: send depth, events depth, webhooks depth, each DLQ
- Consumer lag (seconds)
- `POST /emails` error rate
- ClickHouse insert failures
- Link-style note: “Grafana remains source of truth for deep infra”

Use clear healthy / degraded / critical badges.

### 8) Audit log (`/audit`)

Global filterable log: date range, action type, account id, actor.

Columns: time, actor, action, account, reason, IP

Row expand → JSON before/after

### 9) Settings (`/settings`)

- Operator name/email (mock)
- Theme: System / Light / Dark
- API base URL input default `http://127.0.0.1:3010` (persist localStorage)
- Mock mode toggle (ON by default)
- Sign out

---

## API client contract (prepare for integration)

Create `src/lib/api.ts` with:

- `ADMIN_API` from `VITE_ADMIN_API_URL` or `http://127.0.0.1:3010`
- Bearer token from `localStorage.mr_ops_token`
- Typed helpers; when Mock mode ON, return fixtures
- When Mock mode OFF, call these paths (even if backend incomplete — show errors cleanly):

```
POST /internal/admin/v1/auth/login          { email, password }
GET  /internal/admin/v1/accounts?q=
GET  /internal/admin/v1/accounts/:id
POST /internal/admin/v1/accounts/:id/restrict   { reason }
POST /internal/admin/v1/accounts/:id/suspend    { reason }
POST /internal/admin/v1/accounts/:id/unsuspend  { reason }
GET  /internal/admin/v1/audit?account_id=
```

Response shapes (snake_case JSON):

Login:

```json
{
  "object": "ops_session",
  "token": "...",
  "operator": { "id": "...", "email": "...", "name": "..." }
}
```

Account list item:

```json
{
  "id": "uuid",
  "name": "Acme",
  "status": "active",
  "status_reason": null,
  "data_region": "in",
  "created_at": "ISO",
  "owner_email": "a@b.com",
  "owner_name": "A"
}
```

Errors: `{ "message": "...", "code": "..." }` with HTTP status.

---

## UX details that matter

- Confirm dialogs for Restrict / Suspend / quota override — never one-click destructive
- Reason field required (min 8 chars)
- Toast on success/failure (Sonner or similar)
- Copy-to-clipboard for UUIDs and key prefixes
- Keyboard: `/` focuses account search; `Esc` closes drawers
- Mobile: usable sidebar sheet; tables horizontal-scroll OK
- Accessibility: focus rings using `--ring`, labels on inputs
- Performance: virtualization not required; keep mock data modest

---

## Explicitly do NOT build

- Public marketing landing page
- Customer signup / onboarding
- Shared session with customer app
- Purple/indigo neon themes
- Glassmorphism overload
- Fake “AI copilot” sidebar
- Inter as the brand font
- Emoji-heavy empty states

---

## Deliverable

A complete runnable Vite app with:

1. All screens above using mock data
2. Design tokens matching MailRocket
3. Dark default + light toggle
4. API client ready for real `admin-api`
5. README: how to run (`pnpm install && pnpm dev`), env `VITE_ADMIN_API_URL`

When finished, make the UI look production-ready for an internal SES reputation / support console — dense, calm, precise — not a consumer SaaS homepage.


you need to add instructions in the code for the ai agent which will be integrating your code into my platform.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a981803c-2193-404e-97c3-b3ba12724c86).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
