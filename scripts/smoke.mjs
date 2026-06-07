// Authenticated smoke test: mint a real session cookie and fetch every page.
import { readFileSync } from "node:fs";
import { SignJWT } from "jose";

// load .env
const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    })
);
for (const [k, v] of Object.entries(env)) process.env[k] = v;

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

const admin = await prisma.user.findUnique({ where: { username: "admin" } });
if (!admin) throw new Error("admin user not found");

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
const token = await new SignJWT({
  id: admin.id,
  username: admin.username,
  name: admin.name,
  role: admin.role,
})
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("30d")
  .sign(secret);

const cookie = `dehai_session=${token}`;
const base = "http://localhost:3000";
const routes = ["/", "/donations", "/accounts", "/expenses", "/targets", "/audit"];

// strings we expect to find in rendered HTML per route
const expect = {
  "/": ["Асосӣ", "смн", "Ҳадафи ҷорӣ"],
  "/donations": ["Хайрияҳо"],
  "/accounts": ["Ҳисобҳо", "Alif Bank"],
  "/expenses": ["Харољотҳо"],
  "/targets": ["Ҳадафҳо", "Марҳилаи"],
  "/audit": ["Таърих"],
};

let failures = 0;
for (const r of routes) {
  try {
    const res = await fetch(base + r, { headers: { cookie }, redirect: "manual" });
    const html = await res.text();
    const missing = (expect[r] || []).filter((s) => !html.includes(s));
    const ok = res.status === 200 && missing.length === 0;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${r.padEnd(12)} status=${res.status} len=${html.length}` +
        (missing.length ? `  MISSING: ${missing.join(", ")}` : "")
    );
  } catch (e) {
    failures++;
    console.log(`FAIL  ${r.padEnd(12)} error=${e.message}`);
  }
}

await prisma.$disconnect();
console.log(failures ? `\n${failures} route(s) failed` : "\nAll routes OK");
process.exit(failures ? 1 : 0);
