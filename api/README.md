# Appointments API (XAMPP + email)

## You do NOT need sendEmail

[sendEmail](https://github.com/zehm/sendEmail) is a separate Perl command-line tool. This project sends email with **PHP + Gmail SMTP** built in — no extra install.

## Configuration: project `.env`

All secrets and SMTP settings live in the **project root** `.env` (same folder as `package.json`), not in `api/config/app.php`.

1. Copy `.env.example` to `.env`
2. Set at minimum:
   - `CLINIC_EMAIL` — inbox for booking notifications
   - `MAIL_SMTP_USER` / `MAIL_SMTP_PASS` — Gmail account + [App Password](https://myaccount.google.com/apppasswords)
   - `VITE_APPOINTMENT_API_URL` — appointments API URL for the React app

Restart **Vite** (`npm run dev`) after changing `VITE_*` variables.

## Step 1 — Fix “Cannot reach the booking server”

That error means the browser could not talk to **Apache + PHP**, not email.

1. Open **XAMPP Control Panel** → start **Apache**.
2. In the browser, open:  
   **http://localhost/ecowealth_v2/api/appointments/book.php**  
   You should see JSON like: `"Appointments API is running"`.
3. Ensure `.env` contains:

   ```
   VITE_APPOINTMENT_API_URL=http://localhost/ecowealth_v2/api/appointments/book.php
   ```

4. Restart Vite: `npm run dev`, then try **Book free check-up** again.

**Or** skip Vite and open the site only via Apache:  
**http://localhost/ecowealth_v2/** (build first: `npm run build`).

## Step 2 — Send appointment emails

PHP `mail()` usually fails on Windows/XAMPP. Use **Gmail SMTP** in `.env`:

```env
MAIL_TRANSPORT=smtp
MAIL_SMTP_HOST=smtp.gmail.com
MAIL_SMTP_PORT=587
MAIL_SMTP_ENCRYPTION=tls
MAIL_SMTP_USER=your@gmail.com
MAIL_SMTP_PASS=your-16-char-app-password
MAIL_FROM_EMAIL=your@gmail.com
CLINIC_EMAIL=inbox@gmail.com
```

Submit a test booking and check the `CLINIC_EMAIL` inbox.

## Backup if email fails

Requests are still saved under `api/storage/appointments/` when `STORE_APPOINTMENTS=true`.

## Requirements

- XAMPP Apache running
- PHP **openssl** extension enabled (default in XAMPP)
- `.env` present in project root
