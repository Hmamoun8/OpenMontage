import type { NextRequest } from "next/server";
import { fail, guard, json } from "@/lib/server/api";
import { db } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const g = guard(req, "verify", 30);
  if (g) return g;
  const code = req.nextUrl.searchParams.get("code")?.toUpperCase() ?? "";
  const a = (await db()).applications.get(code);
  if (!a) return fail("not_found", 404);
  return json({
    tracking: a.tracking, service: a.service, mission: a.mission, status: a.status,
    holder: a.fullName.replace(/(\S)\S*/g, "$1•••"), issued: a.history.at(-1)?.at,
    valid: ["approved", "ready_for_pickup", "dispatched", "completed"].includes(a.status),
  });
}
