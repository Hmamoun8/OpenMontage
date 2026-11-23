import "server-only";
import { randomDigits, sha256, type Role } from "./security";
import { MISSIONS } from "../data/missions";
import { SERVICES } from "../data/services";

/**
 * In-memory data store for the demonstration build.
 * The production schema for PostgreSQL lives in /prisma/schema.prisma; swap these
 * functions for repository calls without changing the API routes.
 */
export type AppStatus =
  | "submitted" | "under_review" | "correction_requested" | "approved"
  | "rejected" | "ready_for_pickup" | "dispatched" | "completed";

export const STATUS_FLOW: AppStatus[] = ["submitted", "under_review", "approved", "ready_for_pickup", "dispatched", "completed"];

export interface Application {
  tracking: string;
  nationalIdHash: string;
  nationalIdLast4: string;
  fullName: string;
  passport: string;
  dob: string;
  contact: string;
  service: string;
  mission: string;
  status: AppStatus;
  files: { name: string; type: string; size: number }[];
  createdAt: string;
  history: { at: string; status: AppStatus; by: string; note?: string }[];
  messages: { at: string; from: string; ar: string; en: string }[];
}

export interface Appointment {
  code: string; mission: string; service: string; date: string; time: string; name: string; contact: string;
  status: "booked" | "cancelled"; createdAt: string;
}

export interface StaffUser { username: string; name: string; role: Exclude<Role, "citizen">; mission?: string; passwordHash: string; mfa: string; active: boolean; permissions: string[] }
export interface AuditEntry { at: string; actor: string; action: string; target: string; ip?: string }

interface DB {
  applications: Map<string, Application>;
  appointments: Map<string, Appointment>;
  otps: Map<string, { hash: string; exp: number; tries: number; verified: boolean }>;
  staff: StaffUser[];
  audit: AuditEntry[];
  capacity: Record<string, number>;
  extraHolidays: Record<string, { date: string; name: string }[]>;
  fees: Record<string, number>;
  statements: { at: string; title: string; titleAr: string; by: string }[];
}

const g = globalThis as unknown as { __mofaDB?: DB };

function daysAgo(n: number) { return new Date(Date.now() - n * 864e5).toISOString(); }

async function seed(): Promise<DB> {
  const db: DB = {
    applications: new Map(), appointments: new Map(), otps: new Map(), audit: [],
    staff: [], capacity: {}, extraHolidays: {}, fees: {}, statements: [],
  };
  const pw = await sha256("Demo@2026");
  db.staff = [
    { username: "officer.berlin", name: "Consular Officer — Berlin", role: "officer", mission: "berlin", passwordHash: pw, mfa: "000000", active: true, permissions: ["applications.review", "appointments.manage"] },
    { username: "officer.riyadh", name: "Consular Officer — Riyadh", role: "officer", mission: "riyadh", passwordHash: pw, mfa: "000000", active: true, permissions: ["applications.review", "appointments.manage"] },
    { username: "admin", name: "Ministry Administrator", role: "admin", passwordHash: pw, mfa: "000000", active: true, permissions: ["*"] },
  ];
  const names = ["Rami Haddad", "Lina Al-Khatib", "Omar Darwish", "Hala Mansour", "Yazan Kassab", "Nour Saleh", "Karim Aziz", "Maya Shami", "Fadi Jaber", "Rana Halabi", "Sami Nasser", "Dana Issa"];
  const statuses: AppStatus[] = ["submitted", "under_review", "correction_requested", "approved", "ready_for_pickup", "under_review", "submitted", "completed", "rejected", "dispatched", "submitted", "under_review"];
  const svc = ["passport-renewal", "birth-registration", "marriage-registration", "passport-first-issue", "academic-attestation", "power-of-attorney"];
  for (let i = 0; i < names.length; i++) {
    const tracking = i === 0 ? "SY-MOFA-2026-10427" : `SY-MOFA-2026-${String(10428 + i * 7).padStart(5, "0")}`;
    const nid = i === 0 ? "01020304050" : `0${randomDigits(10)}`;
    const st = statuses[i];
    const flow = st === "correction_requested" || st === "rejected" ? ["submitted", "under_review", st] as AppStatus[]
      : STATUS_FLOW.slice(0, STATUS_FLOW.indexOf(st) + 1);
    const mission = i % 3 === 2 ? "riyadh" : "berlin";
    db.applications.set(tracking, {
      tracking, nationalIdHash: await sha256(nid), nationalIdLast4: nid.slice(-4), fullName: names[i], passport: `N${randomDigits(7)}`,
      dob: `19${80 + i}-0${(i % 9) + 1}-1${i % 9}`, contact: `${names[i].split(" ")[0].toLowerCase()}@example.com`,
      service: svc[i % svc.length], mission, status: st,
      files: [{ name: "passport-copy.pdf", type: "application/pdf", size: 812_000 }, { name: "photo.jpg", type: "image/jpeg", size: 240_000 }],
      createdAt: daysAgo(14 - i),
      history: flow.map((s, k) => ({ at: daysAgo(14 - i - k), status: s, by: k === 0 ? "citizen" : `officer.${mission}` })),
      messages: st === "correction_requested"
        ? [{ at: daysAgo(1), from: `officer.${mission}`, ar: "يرجى رفع صورة شخصية بخلفية بيضاء.", en: "Please upload a photo with a white background." }]
        : st === "ready_for_pickup"
          ? [{ at: daysAgo(0), from: `officer.${mission}`, ar: "وثيقتك جاهزة للاستلام خلال ساعات العمل.", en: "Your document is ready for collection during working hours." }]
          : [],
    });
  }
  MISSIONS.forEach((m) => (db.capacity[m.slug] = m.dailyCapacity));
  SERVICES.forEach((s) => (db.fees[s.slug] = s.feeUSD));
  db.audit.push({ at: daysAgo(0), actor: "system", action: "seed", target: "database" });
  return db;
}

let seeding: Promise<DB> | null = null;
export async function db(): Promise<DB> {
  if (g.__mofaDB) return g.__mofaDB;
  seeding ??= seed().then((d) => (g.__mofaDB = d));
  return seeding;
}

export async function audit(actor: string, action: string, target: string, ip?: string) {
  (await db()).audit.unshift({ at: new Date().toISOString(), actor, action, target, ip });
}

export async function newTrackingNumber(): Promise<string> {
  const d = await db();
  const year = new Date().getFullYear();
  let t: string;
  do t = `SY-MOFA-${year}-${randomDigits(5)}`; while (d.applications.has(t));
  return t;
}

export async function newAppointmentCode(): Promise<string> {
  const d = await db();
  let c: string;
  do c = `APT-${randomDigits(6)}`; while (d.appointments.has(c));
  return c;
}

/** Slots: 09:00–14:30 every 30 minutes; capacity spread across slots. */
export const SLOT_TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"];

export async function slotAvailability(mission: string, date: string) {
  const d = await db();
  const m = MISSIONS.find((x) => x.slug === mission);
  if (!m) return null;
  const day = new Date(date + "T12:00:00Z").getUTCDay();
  const holidays = [...m.holidays.map((h) => h.date), ...(d.extraHolidays[mission] ?? []).map((h) => h.date)];
  if (!m.workdays.includes(day) || holidays.includes(date)) return { closed: true, slots: [] as { time: string; left: number }[] };
  const perSlot = Math.max(1, Math.floor((d.capacity[mission] ?? m.dailyCapacity) / SLOT_TIMES.length));
  const booked = [...d.appointments.values()].filter((a) => a.mission === mission && a.date === date && a.status === "booked");
  // deterministic pseudo-load so the demo calendar looks lived-in
  const seedLoad = (t: string) => (date.charCodeAt(9) + t.charCodeAt(1) + t.charCodeAt(3)) % (perSlot + 1);
  return {
    closed: false,
    slots: SLOT_TIMES.map((time) => ({ time, left: Math.max(0, perSlot - seedLoad(time) - booked.filter((b) => b.time === time).length) })),
  };
}
