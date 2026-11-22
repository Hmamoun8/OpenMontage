import type { NextRequest } from "next/server";
import { z } from "zod";
import { clientIp, fail, guard, json, requireRole } from "@/lib/server/api";
import { audit, db } from "@/lib/server/store";
import { sha256 } from "@/lib/server/security";
import { MISSIONS } from "@/lib/data/missions";

export async function GET(req: NextRequest) {
  const g = guard(req, "admin", 120);
  if (g) return g;
  const s = await requireRole(req, ["admin"]);
  if (s instanceof Response) return s;
  const d = await db();
  const apps = [...d.applications.values()];
  const byStatus: Record<string, number> = {};
  const byService: Record<string, number> = {};
  apps.forEach((a) => { byStatus[a.status] = (byStatus[a.status] ?? 0) + 1; byService[a.service] = (byService[a.service] ?? 0) + 1; });
  const performance = MISSIONS.map((m) => {
    const mine = apps.filter((a) => a.mission === m.slug);
    const done = mine.filter((a) => ["approved", "ready_for_pickup", "dispatched", "completed", "rejected"].includes(a.status));
    return { mission: m.slug, total: mine.length, decided: done.length, capacity: d.capacity[m.slug] };
  }).filter((p) => p.total > 0);
  return json({
    totals: { applications: apps.length, appointments: d.appointments.size, missions: MISSIONS.length, staff: d.staff.length },
    byStatus, byService, performance, fees: d.fees, statements: d.statements,
    staff: d.staff.map(({ passwordHash, mfa, ...u }) => u), audit: d.audit.slice(0, 100),
  });
}

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("fee"), service: z.string(), value: z.number().min(0).max(10000) }),
  z.object({ action: z.literal("staff-create"), username: z.string().regex(/^[a-z0-9.]{3,40}$/), name: z.string().min(2).max(80), role: z.enum(["officer", "admin"]), mission: z.string().optional() }),
  z.object({ action: z.literal("staff-toggle"), username: z.string() }),
  z.object({ action: z.literal("staff-permissions"), username: z.string(), permissions: z.array(z.string().max(60)).max(20) }),
  z.object({ action: z.literal("statement"), title: z.string().min(3).max(200), titleAr: z.string().min(3).max(200) }),
]);

export async function POST(req: NextRequest) {
  const g = guard(req, "admin-act", 30);
  if (g) return g;
  const s = await requireRole(req, ["admin"]);
  if (s instanceof Response) return s;
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return fail("invalid_input");
  const d = await db();
  const b = p.data;
  let target = "";
  switch (b.action) {
    case "fee": d.fees[b.service] = b.value; target = b.service; break;
    case "staff-create":
      if (d.staff.some((u) => u.username === b.username)) return fail("exists", 409);
      d.staff.push({ username: b.username, name: b.name, role: b.role, mission: b.mission, passwordHash: await sha256("Demo@2026"), mfa: "000000", active: true, permissions: b.role === "admin" ? ["*"] : ["applications.review"] });
      target = b.username; break;
    case "staff-toggle": { const u = d.staff.find((x) => x.username === b.username); if (!u || u.username === s.sub) return fail("invalid"); u.active = !u.active; target = b.username; break; }
    case "staff-permissions": { const u = d.staff.find((x) => x.username === b.username); if (!u) return fail("not_found", 404); u.permissions = b.permissions; target = b.username; break; }
    case "statement": d.statements.unshift({ at: new Date().toISOString(), title: b.title, titleAr: b.titleAr, by: s.sub }); target = b.title; break;
  }
  await audit(s.sub, `admin.${b.action}`, target, clientIp(req));
  return json({ ok: true });
}
