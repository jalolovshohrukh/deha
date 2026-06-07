import { readFileSync } from "node:fs";
import { SignJWT } from "jose";
const env = Object.fromEntries(readFileSync(new URL("../.env", import.meta.url),"utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^"|"$/g,"")];}));
for (const [k,v] of Object.entries(env)) process.env[k]=v;
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();
const admin = await prisma.user.findUnique({ where: { username: "admin" } });
const token = await new SignJWT({ id: admin.id, username: admin.username, name: admin.name, role: admin.role }).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("30d").sign(new TextEncoder().encode(process.env.AUTH_SECRET));
const accounts = await prisma.account.findMany();
let fails = 0;
for (const a of accounts) {
  const res = await fetch(`http://localhost:3000/accounts/${a.id}`, { headers: { cookie: `dehai_session=${token}` }, redirect: "manual" });
  const html = await res.text();
  const want = [a.name, "Ҳаракатҳо", "Бақия"];
  const missing = want.filter(s => !html.includes(s));
  const ok = res.status === 200 && missing.length === 0;
  if (!ok) fails++;
  console.log(`${ok?"PASS":"FAIL"}  /accounts/${a.id.slice(0,8)} (${a.name})  status=${res.status} len=${html.length}` + (missing.length?`  MISSING: ${missing}`:""));
}
// 404 check for a bogus id
const bogus = await fetch(`http://localhost:3000/accounts/nonexistent123`, { headers: { cookie: `dehai_session=${token}` }, redirect: "manual" });
console.log(`bogus id -> status=${bogus.status} (expect 404)`);
await prisma.$disconnect();
process.exit(fails?1:0);
