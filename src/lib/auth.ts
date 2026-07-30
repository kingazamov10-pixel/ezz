import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { readEnv } from "./env";

const COOKIE_NAME = "ielts_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  return (
    readEnv("AUTH_SECRET") ||
    readEnv("DATABASE_URL") ||
    "fallback-dev-secret-please-set-AUTH_SECRET"
  );
}

export function getAdminPassword(): string {
  return readEnv("ADMIN_PASSWORD") || "admin123";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function makeToken(): string {
  const issuedAt = Date.now().toString();
  const sig = sign(issuedAt);
  return `${issuedAt}.${sig}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;
  const expected = sign(issuedAt);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const age = Date.now() - Number(issuedAt);
  if (Number.isNaN(age) || age < 0 || age > MAX_AGE * 1000) return false;
  return true;
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

export async function login(password: string): Promise<boolean> {
  if (password !== getAdminPassword()) return false;
  const store = await cookies();
  store.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function logout() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
