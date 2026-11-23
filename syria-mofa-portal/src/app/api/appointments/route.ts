import type { NextRequest } from "next/server";
import { z } from "zod";
import { clientIp, fail, guard, json } from "@/lib/server/api";
import { audit, db, newAppointmentCode, slotAvailability } from "@/lib/server/store";

const Body = z.object({
  mission: z.string(), service: z.string(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().min(3).max(120), contact: z.string().min(5).max(120),
});

export async function POST(req: NextRequest) {
  const g = guard(req, "appt", 10);
  if (g) return g;
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return fail("invalid_input");
  if (new Date(p.data.date) < new Date(new Date().toDateString())) return fail("past_date");
  const av = await slotAvailability(p.data.mission, p.data.date);
  if (!av || av.closed || !av.slots.find((s) => s.time === p.data.time && s.left > 0)) return fail("slot_unavailable", 409);
  const code = await newAppointmentCode();
  const appt = { ...p.data, code, status: "booked" as const, createdAt: new Date().toISOString() };
  (await db()).appointments.set(code, appt);
  await audit("citizen", "appointment.book", code, clientIp(req));
  return json(appt);
}
