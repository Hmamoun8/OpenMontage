import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, guard, json } from "@/lib/server/api";
import { db } from "@/lib/server/store";
import { sha256 } from "@/lib/server/security";

const Body = z.object({ tracking: z.string().regex(/^SY-MOFA-\d{4}-\d{5}$/i), nationalId: z.string().regex(/^\d{11}$/) });

export async function POST(req: NextRequest) {
  const g = guard(req, "track", 20);
  if (g) return g;
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return fail("invalid_input");
  const a = (await db()).applications.get(p.data.tracking.toUpperCase());
  // Same response for "not found" and "wrong ID" to prevent enumeration.
  if (!a || a.nationalIdHash !== (await sha256(p.data.nationalId))) return fail("not_found", 404);
  const { nationalIdHash, passport, contact, ...safe } = a;
  return json({ ...safe, passport: passport ? passport.slice(0, 2) + "•••••" : "" });
}
