# Snipe-IT — Next.js Migration

## Overview
Full migration of Snipe-IT IT asset management from Laravel/PHP to **Next.js 14 + PostgreSQL**. Complete feature parity with the original open-source tool.

## Stack
- **Framework**: Next.js 14 (App Router, TypeScript, Server Components + Server Actions)
- **Database**: PostgreSQL (Replit built-in) via `pg` (node-postgres) — Prisma CLI was unusable due to environment stack size limits
- **Auth**: NextAuth.js v5 (credentials provider, JWT sessions)
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 20

## App Location
All Next.js source code lives in **`snipeit-next/`**. The old Laravel app is in `snipe-it-master/` (no longer used).

## Running the App
The workflow runs: `cd snipeit-next && npm run dev` on port 5000.

## Default Login
- **Username**: `admin`
- **Password**: `password`

## Architecture Notes
- **No Prisma ORM at runtime** — all DB access goes through `lib/db.ts` (pg Pool) and `lib/queries.ts`
- **Middleware** uses `getToken` from `next-auth/jwt` (not the auth handler) to avoid Node.js crypto in Edge Runtime
- **Tables**: Created via raw SQL (not `prisma db push`) — schema is in `snipeit-next/prisma/schema.prisma` for reference only

## Modules Implemented
- Dashboard (stats + activity feed)
- Assets (list, create, edit, detail, checkout/checkin)
- Users (list, create, edit, detail)
- Licenses (list, create, detail, seat management)
- Accessories, Consumables, Components
- Categories, Manufacturers, Suppliers, Locations, Companies, Departments
- Status Labels, Depreciations, Asset Models
- Reports (Activity Log, Maintenance)
- Settings
- Account Profile

## User Preferences
- Use pg (node-postgres) directly — never Prisma ORM
- All DB tables use quoted camelCase column names (e.g., `"firstName"`, `"assetTag"`)
- Server Actions for all mutations, Server Components for data fetching
