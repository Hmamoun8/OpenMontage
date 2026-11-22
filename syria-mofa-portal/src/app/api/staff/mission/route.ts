import type { NextRequest } from "next/server";
import { z } from "zod";
import { clientIp, fail, guard, json, requireRole } from "@/lib/server/api";
import { audit, db } from "@/lib/server/store";

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("capacity"), mission: z.string(), value: z.number().int().min(0).max(500) }),
  z.object({ action: z.literal("holiday"), mission: z.string(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), name: z.string().min(2).max(80) }),
  z.object({ action: z.literal("holiday-remove"), mission: z.string(), date: z.string() }),
]);

export async function POST(req: NextRequest) {
  const g = guard(req, "mission", 30);
  if (g) return g;
  const s = await requireRole(req, ["officer", "admin"]);
  if (s instanceof Response) return s;
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return fail("invalid_input");
  if (s.role === "officer" && p.data.mission !== s.mission) return fail("forbidden", 403);
  const d = await db();
  const b = p.data;
  if (b.action === "capacity") d.capacity[b.mission] = b.value;
  else if (b.action === "holiday") (d.extraHolidays[b.mission] ??= []).push({ date: b.date, name: b.name });
  else d.extraHolidays[b.mission] = (d.extraHolidays[b.mission] ?? []).filter((h) => h.date !== b.date);
  await audit(s.sub, `mission.${b.action}`, b.mission, clientIp(req));
  return json({ ok: true, capacity: d.capacity[b.mission], holidays: d.extraHolidays[b.mission] ?? [] });
}
