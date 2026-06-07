// Build-time DB setup for Vercel/Neon: create tables + seed the login accounts.
// Tolerates whatever the host named the connection vars (DATABASE_URL,
// POSTGRES_PRISMA_URL, POSTGRES_URL, *_NON_POOLING / *_UNPOOLED, etc.) and falls
// back to the pooled URL when no direct URL is provided.
import { execSync } from "node:child_process";

const pick = (...names) => {
  for (const n of names) if (process.env[n]) return process.env[n];
  return undefined;
};

const url = pick("DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL");
const direct =
  pick("DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING", "POSTGRES_URL_NO_SSL") || url;

if (!url) {
  console.error(
    "DB setup: no Postgres connection found. Set DATABASE_URL (or add a Neon/Postgres database in Vercel)."
  );
  process.exit(1);
}

// Use the DIRECT (non-pooled) URL for schema push when available — pooled
// (PgBouncer) connections can choke on DDL. Runtime keeps the host's DATABASE_URL.
const env = { ...process.env, DATABASE_URL: direct };

console.log("DB setup: creating tables (prisma db push)...");
execSync("npx prisma db push --skip-generate", { stdio: "inherit", env });
console.log("DB setup: seeding admin/viewer logins...");
execSync("node prisma/seed-prod.mjs", { stdio: "inherit", env });
console.log("DB setup: done.");
