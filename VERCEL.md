# Vercel setup (Eco Wealth v2)

Use this checklist when importing from GitHub. Importing `.env` in the UI is **not enough** unless names and scopes match exactly.

## 1. Project settings (Build & Deployment)

| Setting | Value |
|---------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (leave empty if `package.json` is at repo root) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node.js Version** | **20.x** (must match `package.json` `engines.node`) |

If the repo is nested (e.g. only `ecowealth_v2` is in a subfolder), set **Root Directory** to that folder name.

## 2. Environment variables (required for booking email)

Add in **Settings → Environment Variables**. Enable **Production** (and Preview if you test preview URLs).

| Name | Required | Notes |
|------|----------|--------|
| `RESEND_API_KEY` | Yes (recommended) | From [resend.com](https://resend.com) → API Keys. Must start with `re_`. |
| `RESEND_FROM_EMAIL` | Yes | e.g. `onboarding@resend.dev` for testing, or `you@yourdomain.com` after domain verify |
| `CLINIC_EMAIL` | Yes | Inbox that receives booking notifications |
| `MAIL_FROM_NAME` | Recommended | e.g. `Eco Wealth Appointments` |

**Exact names** — Vercel is case-sensitive. Wrong examples that **do not work**:

- `resend_api_key` ❌ → use `RESEND_API_KEY` ✅
- `Resend_Api_Key` ❌

**Do not set** on Vercel (unless you mean to):

- `VITE_APPOINTMENT_API_URL` — leave unset; the site uses `/api/appointments` on the same domain
- `BOOKING_SECURITY_ENABLED=true` without `RATE_LIMIT_SALT` (16+ chars) — can crash the API in production

**Optional (local/XAMPP only, not needed on Vercel):**

- `MAIL_SMTP_*` — Gmail SMTP often fails on Vercel; use Resend instead
- `STORE_APPOINTMENTS`, `ALLOWED_ORIGINS`

After changing env vars: **Deployments → … → Redeploy** (env does not apply to old deployments until redeploy).

## 3. Import `.env` on Vercel

When using **Import .env**:

1. Open your local `.env` and ensure keys are **UPPERCASE** as in the table above.
2. Remove lines you do not need on Vercel (e.g. `ALLOWED_ORIGINS` if unused).
3. After import, open each variable in Vercel and confirm **Production** is checked.

## 4. Verify deployment

1. **GET** `https://YOUR-PROJECT.vercel.app/api/appointments`  
   - Expect **200** JSON with `"emailConfigured": true` and `"provider": "resend"`.
   - If **500** / `FUNCTION_INVOCATION_FAILED`: open **Deployments → latest → Functions → Logs**.
2. **POST** same URL with JSON body (see README or Postman collection).

## 5. Git connection

- Repository: `Convictor007/ecowealth`
- Branch: `main`
- Every push to `main` should trigger a new deployment.

## 6. Common issues

| Symptom | Fix |
|---------|-----|
| `DEPLOYMENT_NOT_FOUND` on old URL | Project was deleted or URL changed; use the URL from the new project (e.g. `ecowealth-five.vercel.app`). |
| Generic 500, no JSON | Function crash at startup — redeploy latest `main`, check function logs, Node 20.x. |
| `emailConfigured: false` | Missing or misspelled env vars; redeploy after fixing. |
| POST 503, Resend message | Verify domain / use `onboarding@resend.dev` for testing only. |
| Site works, booking fails | Env vars only affect **serverless** functions, not the static Vite build. |

## 7. Postman

```
GET  https://YOUR-PROJECT.vercel.app/api/appointments
POST https://YOUR-PROJECT.vercel.app/api/appointments
Content-Type: application/json
```

Body example:

```json
{
  "fullName": "Test User",
  "phone": "09198613002",
  "email": "patient@example.com",
  "service": "free-checkup",
  "preferredDate": "2026-06-15",
  "preferredTime": "10:00",
  "notes": "Test"
}
```
