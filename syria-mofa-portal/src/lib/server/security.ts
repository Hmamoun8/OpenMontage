/**
 * Security primitives. Uses Web Crypto so it runs in both the Node and Edge runtimes.
 * Production deployment: back sessions with the identity provider (OIDC + MFA), keep
 * SESSION_SECRET in a secrets manager, and move rate limiting to a shared store (Redis).
 */
export type Role = "citizen" | "officer" | "admin";
export interface Session { sub: string; name: string; role: Role; mission?: string; exp: number }

const enc = new TextEncoder();
const SECRET = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";

async function hmacKey() {
  return crypto.subtle.importKey("raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf as ArrayBuffer))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

export async function signSession(s: Omit<Session, "exp">, ttlSec = 60 * 60 * 8): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify({ ...s, exp: Math.floor(Date.now() / 1000) + ttlSec })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(), fromB64url(sig), enc.encode(payload));
    if (!ok) return null;
    const s = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as Session;
    return s.exp > Date.now() / 1000 ? s : null;
  } catch {
    return null;
  }
}

export async function sha256(s: string) {
  return b64url(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}

export function randomDigits(n: number) {
  const a = crypto.getRandomValues(new Uint32Array(n));
  return Array.from(a, (x) => x % 10).join("");
}

export const SESSION_COOKIE = "mofa_session";
export const CSRF_COOKIE = "mofa_csrf";
export const CSRF_HEADER = "x-csrf-token";

// ---- Rate limiting (fixed window, per-process) ----
const buckets = new Map<string, { n: number; reset: number }>();
export function rateLimit(key: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  b.n++;
  return b.n <= limit;
}
