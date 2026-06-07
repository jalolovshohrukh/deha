import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";

// Lazily resolved + memoized so merely importing this module (e.g. during
// `next build`) does not require AUTH_SECRET — only an actual auth operation does.
let _secret: Uint8Array | null = null;
function secret(): Uint8Array {
  if (_secret) return _secret;
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET is missing or too short (need >= 32 chars). Set it in your environment."
      );
    }
    // Dev only: never used in production thanks to the guard above.
    _secret = new TextEncoder().encode((raw || "dev-secret-change-me").padEnd(32, "0"));
    return _secret;
  }
  _secret = new TextEncoder().encode(raw);
  return _secret;
}
const COOKIE = "dehai_session";

export type SessionUser = {
  id: string;
  username: string;
  name: string;
  role: "admin" | "viewer";
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());

  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function destroySession() {
  cookies().set(COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return {
      id: payload.id as string,
      username: payload.username as string,
      name: payload.name as string,
      role: payload.role as "admin" | "viewer",
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    throw new Error("Иҷозат нест (admin only)");
  }
  return user;
}

export async function logAudit(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string | null,
  details?: string
) {
  try {
    await prisma.auditLog.create({
      data: { userId: userId ?? undefined, action, entity, entityId: entityId ?? undefined, details },
    });
  } catch {
    // never let audit logging break a real operation
  }
}
