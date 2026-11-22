import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, guard, json } from "@/lib/server/api";
import { db } from "@/lib/server/store";
import { sha256 } from "@/lib/server/security";

const Body = z.object({ destination: z.string().min(5).max(120), code: z.string().regex(/^\d{6}$/) });

export async function POST(req: NextRequest) {
  const g = guard(req, "otp-verify", 10);
  if (g) return g;
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return fail("invalid_input");
  const rec = (await db()).otps.get(p.data.destination);
  if (!rec || rec.exp < Date.now()) return fail("expired");
  if (++rec.tries > 5) return fail("too_many_attempts", 429);
  if (rec.hash !== (await sha256(p.data.code))) return fail("wrong_code");
  rec.verified = true;
  return json({ verified: true });
}
