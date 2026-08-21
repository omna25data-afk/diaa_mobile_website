import { timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../drizzle/schema";
import { EXTERNAL_SESSION_COOKIE, ONE_YEAR_MS } from "../shared/const";
import { ENV } from "./_core/env";

type AdminSession = { email: string; name: string; role: "admin" };

function sessionKey() {
  if (ENV.jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be set to a long random value before enabling admin login.");
  }
  return new TextEncoder().encode(ENV.jwtSecret);
}

function sameValue(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function makeAdminUser(session: AdminSession): User {
  const now = new Date();
  return {
    id: -1,
    openId: `external-admin:${session.email}`,
    name: session.name,
    email: session.email,
    loginMethod: "environment-admin",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

function requestIsSecure(req: Request) {
  const forwarded = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return req.protocol === "https" || proto === "https";
}

export function externalCookieOptions(req: Request) {
  return {
    httpOnly: true,
    secure: requestIsSecure(req),
    sameSite: "lax" as const,
    path: "/",
    maxAge: ONE_YEAR_MS,
  };
}

export function validateAdminCredentials(email: string, password: string) {
  if (!ENV.adminEmail || !ENV.adminPassword) return false;
  return email.trim().toLowerCase() === ENV.adminEmail.trim().toLowerCase() && sameValue(password, ENV.adminPassword);
}

export async function createAdminSession() {
  if (!ENV.adminEmail || !ENV.adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured before logging in.");
  }
  const expiresAt = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return new SignJWT({ email: ENV.adminEmail, name: ENV.adminName, role: "admin" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(sessionKey());
}

export async function authenticateExternalAdmin(req: Request): Promise<User | null> {
  const token = req.headers.cookie
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${EXTERNAL_SESSION_COOKIE}=`))
    ?.slice(EXTERNAL_SESSION_COOKIE.length + 1);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ["HS256"] });
    if (payload.role !== "admin" || typeof payload.email !== "string" || typeof payload.name !== "string") return null;
    if (!ENV.adminEmail || payload.email.toLowerCase() !== ENV.adminEmail.toLowerCase()) return null;
    return makeAdminUser({ email: payload.email, name: payload.name, role: "admin" });
  } catch {
    return null;
  }
}
