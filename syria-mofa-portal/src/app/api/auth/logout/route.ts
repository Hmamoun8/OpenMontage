import type { NextRequest } from "next/server";
import { guard, json } from "@/lib/server/api";
import { SESSION_COOKIE } from "@/lib/server/security";

export async function POST(req: NextRequest) {
  const g = guard(req, "logout", 20);
  if (g) return g;
  const res = json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
