# EcoWealth MySQL setup (XAMPP)

## Tables

| Table | PK | Purpose |
|-------|-----|---------|
| `user` | `id` AUTO_INCREMENT | Patients (booking) and staff/admin |
| `appointment` | `id` AUTO_INCREMENT | Booking requests linked to `user` |
| `products` | `id` AUTO_INCREMENT | In-clinic product catalog |
| `audit` | `id` AUTO_INCREMENT | Action log (bookings, seeds, etc.) |

Clinic info and appointment **service options** remain in `public/api/clinic.json` and `public/api/appointment-services.json`.

## 1. Create database

```bash
mysql -u root < database/schema.sql
```

| Setting | Value |
|---------|--------|
| Database | `ecowealth` |
| User | `ecowealth` |
| Password | `ecowealth_pass` |

## 2. Configure `.env`

```bash
cp .env.example .env
```

## 3. Seed products + default admin user

```bash
php database/seed.php
```

## 4. API endpoints

| Endpoint | Data source |
|----------|-------------|
| `api/v1/clinic.php` | JSON file |
| `api/v1/appointment-services.php` | JSON file |
| `api/v1/products.php` | `products` table |
| `api/v1/appointments.php` | `user` + `appointment` + `audit` |
