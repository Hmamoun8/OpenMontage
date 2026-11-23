import type { NextRequest } from "next/server";
import { z } from "zod";
import { clientIp, fail, guard, json } from "@/lib/server/api";
import { audit, db } from "@/lib/server/store";
import { SESSION_COOKIE, sha256, signSession } from "@/lib/server/security";

const Body = z.object({ username: z.string().max(60), password: z.string().max(200), mfa: z.string().regex(/^\d{6}$/) });

export async function POST(req: NextRequest) {
  const g = guard(req, "login", 5);
  if (g) return g;
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return fail("invalid_input");
  const u = (await db()).staff.find((s) => s.username === p.data.username && s.active);
  // Production: TOTP verification (RFC 6238) against the user's enrolled secret.
  if (!u || u.passwordHash !== (await sha256(p.data.password)) || u.mfa !== p.data.mfa) {
    await audit(p.data.username, "auth.failed", "login", clientIp(req));
    return fail("invalid_credentials", 401);
  }
  const token = await signSession({ sub: u.username, name: u.name, role: u.role, mission: u.mission });
  await audit(u.username, "auth.login", "session", clientIp(req));
  const res = json({ role: u.role, mission: u.mission });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return res;
}
