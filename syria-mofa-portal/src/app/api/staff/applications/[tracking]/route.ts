import type { NextRequest } from "next/server";
import { z } from "zod";
import { clientIp, fail, guard, json, requireRole } from "@/lib/server/api";
import { audit, db, type AppStatus } from "@/lib/server/store";

const Body = z.object({
  action: z.enum(["under_review", "approved", "rejected", "correction_requested", "ready_for_pickup", "dispatched", "completed"]),
  messageAr: z.string().max(1000).optional(), messageEn: z.string().max(1000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ tracking: string }> }) {
  const g = guard(req, "staff-act", 60);
  if (g) return g;
  const s = await requireRole(req, ["officer", "admin"]);
  if (s instanceof Response) return s;
  const tracking = (await params).tracking;
  const a = (await db()).applications.get(tracking);
  if (!a) return fail("not_found", 404);
  if (s.role === "officer" && a.mission !== s.mission) return fail("forbidden", 403);
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return fail("invalid_input");
  const now = new Date().toISOString();
  a.status = p.data.action as AppStatus;
  a.history.push({ at: now, status: a.status, by: s.sub, note: p.data.messageEn });
  if (p.data.messageAr || p.data.messageEn) a.messages.push({ at: now, from: s.sub, ar: p.data.messageAr ?? p.data.messageEn ?? "", en: p.data.messageEn ?? p.data.messageAr ?? "" });
  await audit(s.sub, `application.${p.data.action}`, tracking, clientIp(req));
  return json({ ok: true, status: a.status });
}
