import type { NextRequest } from "next/server";
import { guard, json, requireRole } from "@/lib/server/api";
import { db } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const g = guard(req, "staff", 120);
  if (g) return g;
  const s = await requireRole(req, ["officer", "admin"]);
  if (s instanceof Response) return s;
  const d = await db();
  const mission = s.role === "admin" ? req.nextUrl.searchParams.get("mission") : s.mission;
  const apps = [...d.applications.values()]
    .filter((a) => !mission || a.mission === mission)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ nationalIdHash, ...a }) => a);
  const appts = [...d.appointments.values()].filter((a) => !mission || a.mission === mission);
  return json({
    session: s, applications: apps, appointments: appts,
    capacity: mission ? d.capacity[mission] : null, holidays: mission ? d.extraHolidays[mission] ?? [] : [],
    activity: d.audit.filter((e) => s.role === "admin" || e.actor === s.sub).slice(0, 30),
  });
}
