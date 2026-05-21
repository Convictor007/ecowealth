# PHP API (XAMPP only)

Used when the site runs on Apache, e.g. `http://localhost/ecowealth_v2/`.

- **Endpoint:** `appointments/book.php` (not `index.php` — Vercel reserves `index.ts` in the same folder)
- **Config:** project root `.env` (loaded by `api/lib/AppConfig.php`)
- **Email:** Gmail SMTP + `api/templates/appointment-email.html`

See the main [README](../README.md) for setup and env vars.
