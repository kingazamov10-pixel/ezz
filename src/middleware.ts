import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "ielts_admin";
const MAX_AGE_MS = 60 * 60 * 24 * 7 * 1000;

function getSecret(): string {
  return (
    (process.env.AUTH_SECRET || "").trim() ||
    (process.env.DATABASE_URL || "").trim() ||
    "fallback-dev-secret-please-set-AUTH_SECRET"
  );
}

// Web Crypto helpers (Edge-runtime compatible)
function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.length % 2 === 0 ? hex : "0" + hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmacSHA256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return bytesToHex(new Uint8Array(sigBuf));
}

async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;
  const expected = await hmacSHA256Hex(getSecret(), issuedAt);
  try {
    if (!timingSafeEqualBytes(hexToBytes(sig), hexToBytes(expected))) return false;
  } catch {
    return false;
  }
  const age = Date.now() - Number(issuedAt);
  if (Number.isNaN(age) || age < 0 || age > MAX_AGE_MS) return false;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page freely
  if (pathname === "/admin/login") return NextResponse.next();

  // Protect all other /admin routes
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const ok = await verifyToken(token);
    if (!ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
