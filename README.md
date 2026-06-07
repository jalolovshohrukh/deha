# 🛣️ Роҳи Деҳа — Village Road Fund Tracker

A mobile-first web app to track village donations and expenses for building the
road, fully in **Tajik** with amounts in **Somoni (смн)**. Runs locally with no
external accounts (SQLite + built-in login). Can be moved to Supabase/Postgres
later without changing features.

## Features

- **Login & roles** — `admin` (add/edit everything) and `viewer` (read-only). Every change is recorded in an **audit log** (who did what, when).
- **Donations** — date + amount required; optional payment method (Alif / DC / Other), age, family name; donors are auto-grouped so repeat gifts add up. **Anonymous** supported.
- **OCR scan-to-autofill** — snap or pick a payment screenshot; the app reads it (on-device, free, via Tesseract.js) and pre-fills amount / date / method for you to review. Manual entry always available.
- **Accounts** — bank / cash / wallet accounts with **computed balances** (never hand-typed) and **transfers** between accounts.
- **Expenses** — always tied to a **source account**, with categories.
- **Targets** — sequential **cumulative** milestones with progress bars; auto-marked "reached" and advance to the next; add more anytime.
- **Dashboard** — totals raised/spent/balance, donor count, average donation, daily & monthly charts, by age, by payment method, top donors, top families, recent activity.
- **Share as image** — one-tap PNG cards (target progress, by-age, by-family) to forward to WhatsApp / Telegram groups.
- **Mobile-first** everywhere, with a bottom tab bar on phones and camera capture for scanning.

## Run it

```bash
npm install        # already done
npm run setup      # create DB tables + seed sample data (already done)
npm run dev        # start at http://localhost:3000
```

Open **http://localhost:3000** and log in:

| Role   | Username | Password   |
|--------|----------|------------|
| Admin  | `admin`  | `admin123` |
| Viewer | `viewer` | `viewer123`|

> Change these in production. In production the app **requires** `AUTH_SECRET`
> to be set to a strong value (≥ 32 characters) — it will refuse to start
> otherwise. Generate one with e.g. `openssl rand -base64 48`.

## Useful commands

- `npm run dev` — development server
- `npm run build && npm start` — production build & run
- `npm run db:seed` — re-seed (sample data is skipped if accounts already exist)
- `npx prisma studio` — browse/edit the database in a GUI

## Deploy to Vercel (Neon Postgres)

1. Import the repo into Vercel.
2. **Storage → Create Database → Neon** and connect it to the project. This adds
   `DATABASE_URL` and `DATABASE_URL_UNPOOLED` to the project's env vars.
3. Add an env var **`AUTH_SECRET`** (≥ 32 chars; `openssl rand -base64 48`).
   Optionally `ADMIN_PASSWORD` / `VIEWER_PASSWORD` to set the login passwords.
4. Deploy. The build runs `prisma db push` (creates tables in Neon) and
   `prisma/seed-prod.mjs` (creates the `admin`/`viewer` logins) automatically.

## Local development against Postgres

The app uses **Postgres** (provider `postgresql`). Put your Neon connection
strings into `.env` (`DATABASE_URL` = pooled, `DATABASE_URL_UNPOOLED` = direct),
then `npm run setup` to create tables and seed sample data, and `npm run dev`.

## Notes

- **OCR** runs in the browser (Russian+English) and downloads its language model
  from a CDN the first time it is used, so the first scan needs internet (cached
  afterward). You always review the parsed values before saving.
- `npm run db:seed` loads **sample/demo** data (for local testing).
  `prisma/seed-prod.mjs` (used by the deploy build) creates **only** the login
  accounts — no demo data.

## Tech

Next.js (App Router) · TypeScript · Tailwind CSS · Prisma + Postgres (Neon) ·
Recharts · Tesseract.js (OCR) · write-excel-file + print (exports) ·
html-to-image (share cards) · jose + bcryptjs (auth).
