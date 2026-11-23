import type { NextRequest } from "next/server";
import { fail, guard, json } from "@/lib/server/api";
import { slotAvailability } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const g = guard(req, "slots", 120);
  if (g) return g;
  const mission = req.nextUrl.searchParams.get("mission") ?? "";
  const date = req.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("invalid_date");
  const r = await slotAvailability(mission, date);
  return r ? json(r) : fail("unknown_mission", 404);
}
