# Eco Wealth Wellnessolution (v2)

Clinic marketing site — Vite, React, TypeScript. Content from static JSON; booking sends email via Gmail SMTP (no database).

**Live:** https://ecowealth-chi.vercel.app

## Quick start

```bash
npm install
cp .env.example .env   # set CLINIC_EMAIL, MAIL_SMTP_*, etc.
npm run dev            # http://localhost:5173
```

For booking API locally, start **Apache (XAMPP)** — the form uses `api/appointments/book.php` automatically in dev.

## Booking (email only)

| Environment | Endpoint |
|-------------|----------|
| **Vercel** | `POST /api/appointments` |
| **XAMPP** | `api/appointments/book.php` |

**Vercel env vars (required):** `CLINIC_EMAIL`, `MAIL_SMTP_USER`, `MAIL_SMTP_PASS`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME`. Do not set `VITE_APPOINTMENT_API_URL` on Vercel.

**Optional security** (disabled unless `BOOKING_SECURITY_ENABLED=true`): `RATE_LIMIT_SALT`, `ALLOWED_ORIGINS`, `APPOINTMENT_RATE_LIMIT_PER_HOUR`.

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
