# Booking (restored from original GitHub)

## What was restored

| Piece | Source commit | Role |
|-------|---------------|------|
| **PHP API** | `6c5d99f` | XAMPP: `api/appointments/index.php` + branded `AppointmentEmailTemplate.php` |
| **Gmail SMTP** | `71d49a9` | Vercel: `api/lib/gmail-smtp.cjs` |
| **Branded email** | `6c5d99f` (ported to TS) | `server/appointments/emailTemplate.ts` — gradient header, patient/visit cards, footer |
| **Booking modal UI** | `6c5d99f` | Original header, form layout, colors |

## Production (Vercel)

- URL: `POST /api/appointments` (legacy `/api/book-appointment` rewrites here)
- Env: `CLINIC_EMAIL`, `MAIL_SMTP_*`, `RATE_LIMIT_SALT`, `ALLOWED_ORIGINS`
- Optional branding: `CLINIC_NAME`, `EMAIL_TAGLINE`, `EMAIL_PRACTITIONER`, etc.

## Local XAMPP

1. Apache + MySQL not required for booking (email only).
2. Site at `http://localhost/ecowealth_v2/` → form posts to PHP automatically.
3. Or `VITE_APPOINTMENT_API_URL=http://localhost/ecowealth_v2/api/appointments/index.php`

## Local Vercel dev

```bash
vercel dev
```

Then open the URL Vercel prints (often `http://localhost:3000`). Booking uses `/api/appointments`.

With Vite on 5173, proxy sends `/api/appointments` → port 3000 (run `vercel dev` first).

## Test email

Submit the booking form; clinic inbox (`CLINIC_EMAIL`) should receive the **full branded HTML** email with “Reply to [patient]” button.
