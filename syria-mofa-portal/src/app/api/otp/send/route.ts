import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, guard, json } from "@/lib/server/api";
import { db } from "@/lib/server/store";
import { randomDigits, sha256 } from "@/lib/server/security";

const Body = z.object({
  channel: z.enum(["email", "sms"]),
  destination: z.string().min(5).max(120),
});

export async function POST(req: NextRequest) {
  const g = guard(req, "otp", 5);
  if (g) return g;
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return fail("invalid_input");
  const { channel, destination } = p.data;
  if (channel === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(destination)) return fail("invalid_email");
  if (channel === "sms" && !/^\+\d{8,15}$/.test(destination.replace(/\s/g, ""))) return fail("invalid_phone");
  const code = randomDigits(6);
  (await db()).otps.set(destination, { hash: await sha256(code), exp: Date.now() + 5 * 60_000, tries: 0, verified: false });
  // Production: dispatch via the SMS / email gateway here and never return the code.
  return json({ sent: true, expiresIn: 300, demoCode: process.env.OTP_GATEWAY ? undefined : code });
}
