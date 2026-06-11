# Eco Wealth Wellnessolution (v2)

Clinic marketing site — Vite, React, TypeScript. **MySQL** stores appointments, products, and clinic info. The React app talks to PHP/Node APIs only (no direct database access).

**Live:** your Vercel URL (e.g. `https://ecowealth-five.vercel.app`)

## Quick start (XAMPP + MySQL)

1. Start **Apache** and **MySQL** in XAMPP.
2. Create the database:

```bash
mysql -u root < database/schema.sql
```

3. Configure and seed:

```bash
npm install
cp .env.example .env
php database/seed.php
npm run dev
```

See [database/README.md](./database/README.md) for credentials and API URLs.

## Booking (MySQL — no email)

| Environment | Endpoint | Storage |
|-------------|----------|---------|
| **Vite dev** | `POST /api/appointments` | MySQL via `mysql2` + `.env` `DB_*` |
| **XAMPP** | `api/appointments/book.php` | MySQL via PHP PDO |
| **Vercel** | `POST /api/appointments` | MySQL when `DB_*` env vars are set |

The booking form collects **name**, **phone**, **service**, date/time, and notes — no email field.

## Content API

With `VITE_USE_MYSQL_API=true` (default in `.env.example`):

| Data | Source |
|------|--------|
| Products | `GET /api/v1/products.php` |
| Clinic | `GET /api/v1/clinic.php` |
| Appointment services | `GET /api/v1/appointment-services.php` |
| Services, colon education, etc. | Static `public/api/*.json` (unchanged) |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (proxies `/api/v1` to XAMPP when MySQL mode is on) |
| `npm run dev:full` | `vercel dev` |
| `npm run build` | Production build → `dist/` |
| `php database/seed.php` | Re-import JSON into MySQL |

## Database tables

| Table | PK | Notes |
|-------|-----|--------|
| `user` | auto-increment | Patients created on booking; optional admin row from seed |
| `appointment` | auto-increment | Linked to `user` |
| `products` | auto-increment | Catalog from seed |
| `audit` | auto-increment | Logs bookings and other actions |

Clinic profile and service dropdown options stay in `public/api/*.json`.

## Project layout

```
database/            schema.sql, seed.php
api/v1/              PHP REST (clinic, products, appointments)
api/appointments/    book.php (XAMPP) + index.ts (Vercel/Node)
api/lib/             PDO, repositories, validation
public/api/          JSON for clinic, services, seed source for products
src/                 React app
```
