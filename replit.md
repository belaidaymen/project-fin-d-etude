# Snipe-IT Next.js

A full IT asset management system built with Next.js, migrated from the PHP/Laravel Snipe-IT application.

## Project Structure

- `snipe-it-next/` — Active Next.js application (the live app)
- `snipe-it-master/` — Original PHP/Laravel source (reference only, not running)

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: PostgreSQL, accessed through Prisma 7
- **Auth**: NextAuth v4 with credentials provider
- **Styling**: Tailwind CSS v4 + custom AdminLTE-style CSS (globals.css)
- **Charts**: Recharts
- **Icons**: Lucide React

## Running the App

```bash
cd snipe-it-next && npm run dev
```

The app serves on port 3000.

## Default Login

After the app is deployed for the first time with no users:
- Visit `/setup` to create the initial admin account
- Or use the seeded default: **username:** `admin` / **password:** `admin123`

## Features

### Asset Management
- Hardware (assets) — full CRUD, check-in/check-out, maintenance logs, activity history
- Asset Models, Categories, Manufacturers, Suppliers, Status Labels
- Depreciation schedules

### Licensing
- Licenses with seat management and user assignment

### Consumables / Accessories / Components
- Full inventory management with checkout tracking

### People
- Users (with roles, departments, locations, company assignment)
- Locations, Departments, Companies

### Admin
- Reports (Activity log, Location report, asset breakdowns)
- Settings (site name, colors, currency, timezone, etc.)

## Environment Variables

Required environment variables:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Secret for NextAuth JWT signing
- `NEXTAUTH_URL` — Full URL of the deployed app

## User Preferences

- Keep AdminLTE-style design consistent throughout the app
- Use Prisma for all database access (no raw SQL in app code)
- Server components for data fetching, client components only for interactivity
- All pages require authentication; redirect to /login if unauthenticated
