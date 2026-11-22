import type { NextRequest } from "next/server";
import { z } from "zod";
import { clientIp, fail, guard, json } from "@/lib/server/api";
import { audit, db, newTrackingNumber } from "@/lib/server/store";
import { sha256 } from "@/lib/server/security";
import { getService } from "@/lib/data/services";
import { getMission } from "@/lib/data/missions";

const MAX = 5 * 1024 * 1024;
const TYPES = ["application/pdf", "image/jpeg"];

const Fields = z.object({
  service: z.string(), mission: z.string(),
  fullName: z.string().min(3).max(120),
  nationalId: z.string().regex(/^\d{11}$/),
  passport: z.string().regex(/^[A-Za-z0-9]{6,9}$/).or(z.literal("")),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  contact: z.string().min(5).max(120),
});

/** Check magic bytes so a renamed file can't pass as PDF/JPG. */
async function sniff(f: File) {
  const b = new Uint8Array(await f.slice(0, 4).arrayBuffer());
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "application/pdf";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  return null;
}

export async function POST(req: NextRequest) {
  const g = guard(req, "apply", 10);
  if (g) return g;
  const form = await req.formData().catch(() => null);
  if (!form) return fail("invalid_form");
  const p = Fields.safeParse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")));
  if (!p.success) return fail("invalid_input");
  const f = p.data;
  if (!getService(f.service) || !getMission(f.mission)) return fail("unknown_service_or_mission");
  const d = await db();
  if (!d.otps.get(f.contact)?.verified) return fail("otp_required", 401);

  const files = form.getAll("files").filter((x): x is File => x instanceof File);
  for (const file of files) {
    if (file.size > MAX) return fail("file_too_large");
    const real = await sniff(file);
    if (!real || !TYPES.includes(real)) return fail("bad_file_type");
    // Production: encrypt (AES-256-GCM, per-object key wrapped by KMS) and write to object storage.
  }

  const tracking = await newTrackingNumber();
  const now = new Date().toISOString();
  d.applications.set(tracking, {
    tracking, nationalIdHash: await sha256(f.nationalId), nationalIdLast4: f.nationalId.slice(-4),
    fullName: f.fullName, passport: f.passport, dob: f.dob, contact: f.contact, service: f.service, mission: f.mission,
    status: "submitted", files: files.map((x) => ({ name: x.name, type: x.type, size: x.size })), createdAt: now,
    history: [{ at: now, status: "submitted", by: "citizen" }], messages: [],
  });
  d.otps.delete(f.contact);
  await audit("citizen", "application.submit", tracking, clientIp(req));
  return json({ tracking, createdAt: now });
}
