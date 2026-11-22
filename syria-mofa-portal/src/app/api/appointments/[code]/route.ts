import type { NextRequest } from "next/server";
import { z } from "zod";
import { clientIp, fail, guard, json } from "@/lib/server/api";
import { audit, db, slotAvailability } from "@/lib/server/store";

type Ctx = { params: Promise<{ code: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const g = guard(req, "appt-get", 30);
  if (g) return g;
  const a = (await db()).appointments.get((await params).code.toUpperCase());
  return a ? json(a) : fail("not_found", 404);
}

const Patch = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("reschedule"), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: z.string().regex(/^\d{2}:\d{2}$/) }),
]);

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const g = guard(req, "appt-patch", 10);
  if (g) return g;
  const code = (await params).code.toUpperCase();
  const a = (await db()).appointments.get(code);
  if (!a) return fail("not_found", 404);
  const p = Patch.safeParse(await req.json().catch(() => null));
  if (!p.success) return fail("invalid_input");
  if (p.data.action === "cancel") a.status = "cancelled";
  else {
    const av = await slotAvailability(a.mission, p.data.date);
    if (!av || av.closed || !av.slots.find((s) => s.time === (p.data as { time: string }).time && s.left > 0)) return fail("slot_unavailable", 409);
    a.date = p.data.date; a.time = p.data.time; a.status = "booked";
  }
  await audit("citizen", `appointment.${p.data.action}`, code, clientIp(req));
  return json(a);
}
