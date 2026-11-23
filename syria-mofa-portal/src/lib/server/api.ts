import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { CSRF_COOKIE, CSRF_HEADER, rateLimit, SESSION_COOKIE, verifySession, type Role, type Session } from "./security";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export const fail = (error: string, status = 400) => json({ error }, status);

export const clientIp = (req: NextRequest) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

/** Rate limit + CSRF (double-submit cookie + origin check) for state-changing requests. */
export function guard(req: NextRequest, bucket: string, limit = 30): NextResponse | null {
  if (!rateLimit(`${bucket}:${clientIp(req)}`, limit)) return fail("rate_limited", 429);
  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host")) return fail("bad_origin", 403);
    const c = req.cookies.get(CSRF_COOKIE)?.value;
    const h = req.headers.get(CSRF_HEADER);
    if (!c || !h || c !== h) return fail("csrf", 403);
  }
  return null;
}

export async function requireRole(req: NextRequest, roles: Role[]): Promise<Session | NextResponse> {
  const s = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!s) return fail("unauthenticated", 401);
  if (!roles.includes(s.role)) return fail("forbidden", 403);
  return s;
}
