# Eco Wealth Wellnessolution (v2)

Clinic marketing site — Vite, React, TypeScript. Content from static JSON; booking sends email via **Resend** (recommended on Vercel) or Gmail SMTP locally (no database).

**Live:** your Vercel URL (e.g. `https://ecowealth-five.vercel.app`)

**Vercel setup:** see [VERCEL.md](./VERCEL.md) — env var names, Node 20.x, redeploy after import `.env`.

## Quick start

```bash
npm install
cp .env.example .env   # set CLINIC_EMAIL, MAIL_SMTP_*, etc.
npm run dev            # http://localhost:5173
```

For booking locally, `npm run dev` serves **`POST /api/appointments`** via a Vite plugin (uses `.env` Resend/SMTP). XAMPP is optional; use `book.php` only when hosting under Apache (`/ecowealth_v2`).

## Booking (email only)

| Environment | Endpoint |
|-------------|----------|
| **Vercel** | `POST /api/appointments` |
| **XAMPP** | `api/appointments/book.php` |

**Vercel env vars (recommended — Resend):** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CLINIC_EMAIL`, `MAIL_FROM_NAME`. Create an API key at [resend.com](https://resend.com) and verify your sending domain (or use `onboarding@resend.dev` only for Resend account testing).

**Alternative (SMTP):** `CLINIC_EMAIL`, `MAIL_SMTP_USER`, `MAIL_SMTP_PASS` — often unreliable on Vercel; prefer Resend.

Do not set `VITE_APPOINTMENT_API_URL` on Vercel.

**Optional security** (disabled unless `BOOKING_SECURITY_ENABLED=true`): `RATE_LIMIT_SALT`, `APPOINTMENT_RATE_LIMIT_PER_HOUR`.

**Email template:** edit `api/templates/appointment-email.html` (used by PHP and Vercel).

**Services list:** edit `public/api/appointment-services.json` (used by the form, PHP validator, and API).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run dev:full` | `vercel dev` (API on port 3000) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

## Project layout

```
public/api/          Static JSON content + appointment-services.json
src/                 React app
api/appointments/    book.php (XAMPP) + index.ts (Vercel)
api/lib/             PHP mail + validation
api/templates/       Branded appointment email HTML
server/appointments/ Vercel serverless logic (validation, SMTP, email)
```

## Optional PHP file backup

Set `STORE_APPOINTMENTS=true` in `.env` to save requests under `api/storage/appointments/` when using XAMPP.
