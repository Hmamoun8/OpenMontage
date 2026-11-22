"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { CalendarPlus, Check, Loader2, Printer, Search } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { useApp } from "@/components/providers";
import { Flag, Mark } from "@/components/brand";
import { api } from "@/lib/client";
import { getMission, MISSIONS } from "@/lib/data/missions";
import { getService, SERVICES } from "@/lib/data/services";
import { fmtDate, tr } from "@/lib/i18n";

type Slot = { time: string; left: number };
type Appt = { code: string; mission: string; service: string; date: string; time: string; name: string; contact: string; status: "booked" | "cancelled" };
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function ics(a: Appt) {
  const dt = a.date.replace(/-/g, "") + "T" + a.time.replace(":", "") + "00";
  const m = getMission(a.mission)!, s = getService(a.service)!;
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MOFAEX//Appointments//EN", "BEGIN:VEVENT", `UID:${a.code}@mofaex.gov.sy`, `DTSTART;TZID=${m.tz}:${dt}`, `SUMMARY:${s.title.en} — ${m.city.en}`, `DESCRIPTION:Appointment ${a.code}`,
    "BEGIN:VALARM", "TRIGGER:-PT48H", "ACTION:DISPLAY", "DESCRIPTION:Reminder", "END:VALARM", "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Reminder", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
}

function Ticket({ a }: { a: Appt }) {
  const { locale, t } = useApp();
  const [qr, setQr] = useState("");
  useEffect(() => { QRCode.toDataURL(`APPT:${a.code}`, { margin: 1, width: 200, color: { dark: "#0B1B33", light: "#fff" } }).then(setQr); }, [a.code]);
  const m = getMission(a.mission)!, s = getService(a.service)!;
  return (
    <motion.div initial={{ opacity: 0, rotateX: -20 }} animate={{ opacity: 1, rotateX: 0 }} className="print-sheet relative mx-auto max-w-xl overflow-hidden rounded-3xl bg-white shadow-gov [perspective:800px]">
      <div className="flex h-2"><div className="flex-1 bg-flag-green" /><div className="flex-1 bg-white" /><div className="flex-1 bg-black" /></div>
      <div className="flex items-center justify-between bg-navy-700 px-6 py-4 text-white"><div className="flex items-center gap-2"><Mark className="h-8 w-8" /><span className="text-sm font-bold">{t.appt.ticket}</span></div><Flag className="h-5 w-auto" /></div>
      <div className="grid gap-4 p-6 sm:grid-cols-[1fr_auto]">
        <dl className="space-y-3 text-sm">
          <div><dt className="text-xs text-navy-300">{t.appt.code}</dt><dd className="font-mono text-2xl font-bold text-emerald-600" dir="ltr">{a.code}</dd></div>
          <div><dt className="text-xs text-navy-300">{t.wizard.mission}</dt><dd className="font-semibold">{tr(m.city, locale)} — {tr(m.country, locale)}</dd></div>
          <div><dt className="text-xs text-navy-300">{t.wizard.service}</dt><dd className="font-semibold">{tr(s.title, locale)}</dd></div>
          <div className="flex gap-6"><div><dt className="text-xs text-navy-300">{t.appt.pick}</dt><dd className="font-semibold">{fmtDate(a.date, locale, { weekday: "long", day: "numeric", month: "long" })}</dd></div><div><dt className="text-xs text-navy-300">{t.appt.slots}</dt><dd className="font-mono font-semibold" dir="ltr">{a.time}</dd></div></div>
          {a.status === "cancelled" && <dd className="chip bg-red-50 text-flag-red">{t.appt.cancelled}</dd>}
        </dl>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {qr && <img src={qr} alt="QR" className="h-36 w-36 self-center" />}
      </div>
      <div className="no-print flex flex-wrap gap-2 border-t border-dashed border-navy-700/20 p-4">
        <button className="btn-ghost !py-2" onClick={() => window.print()}><Printer className="h-4 w-4" />{t.common.print}</button>
        <a className="btn-ghost !py-2" href={ics(a)} download={`${a.code}.ics`}><CalendarPlus className="h-4 w-4" />.ics</a>
        <p className="w-full text-xs text-navy-300">{t.appt.reminder}</p>
      </div>
    </motion.div>
  );
}

function Calendar({ mission, value, onPick }: { mission: string; value: string; onPick: (d: string) => void }) {
  const { locale, t } = useApp();
  const m = getMission(mission);
  const days = useMemo(() => Array.from({ length: 28 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; }), []);
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {days.map((d) => {
        const k = iso(d);
        const closed = !m || !m.workdays.includes(d.getDay()) || m.holidays.some((h) => h.date === k);
        return (
          <button key={k} disabled={closed} onClick={() => onPick(k)} aria-pressed={value === k}
            className={`rounded-xl border p-2 text-center transition ${value === k ? "border-emerald-500 bg-emerald-500 text-white" : closed ? "border-transparent bg-ivory-200/50 text-navy-300/50" : "border-navy-700/10 hover:border-gold-500"}`}>
            <div className="text-[10px] uppercase opacity-70">{fmtDate(d, locale, { weekday: "short" })}</div>
            <div className="text-lg font-bold">{d.getDate()}</div>
            <div className="text-[10px] opacity-70">{closed ? t.appt.closed : fmtDate(d, locale, { month: "short" })}</div>
          </button>
        );
      })}
    </div>
  );
}

function Appointments() {
  const { locale, t } = useApp();
  const sp = useSearchParams();
  const [mission, setMission] = useState(sp.get("mission") ?? "");
  const [service, setService] = useState(sp.get("service") ?? "passport-renewal");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [booked, setBooked] = useState<Appt | null>(null);
  // manage
  const [code, setCode] = useState("");
  const [found, setFound] = useState<Appt | null>(null);
  const [resDate, setResDate] = useState("");
  const [resSlots, setResSlots] = useState<Slot[] | null>(null);

  async function loadSlots(m: string, d: string, set: (s: Slot[] | null) => void) {
    set(null);
    const r = await api<{ closed: boolean; slots: Slot[] }>(`/api/appointments/slots?mission=${m}&date=${d}`);
    set(r.ok ? r.data.slots : []);
  }
  useEffect(() => { if (mission && date) { setTime(""); loadSlots(mission, date, setSlots); } }, [mission, date]);
  useEffect(() => { if (found && resDate) loadSlots(found.mission, resDate, setResSlots); }, [found, resDate]);

  async function reserve() {
    setBusy(true); setErr("");
    const r = await api<Appt>("/api/appointments", { method: "POST", json: { mission, service, date, time, name, contact } });
    setBusy(false);
    if (!r.ok) return setErr(r.data.error ?? "error");
    setBooked(r.data);
  }
  async function find(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const r = await api<Appt>(`/api/appointments/${encodeURIComponent(code.trim())}`);
    if (!r.ok) { setFound(null); return setErr(t.tracker.notFound); }
    setFound(r.data);
  }
  async function patch(body: object) {
    if (!found) return;
    const r = await api<Appt>(`/api/appointments/${found.code}`, { method: "PATCH", json: body });
    if (r.ok) { setFound(r.data); setResDate(""); setResSlots(null); } else setErr(r.data.error ?? "error");
  }

  return (
    <>
      <PageHero eyebrow={t.nav.services} title={t.appt.title} lead={t.appt.lead} />
      <div className="container-gov -mt-10 grid gap-6 pb-12 lg:grid-cols-[1fr_380px]">
        <section className="card p-6 sm:p-8">
          {booked ? <Ticket a={booked} /> : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="am">{t.wizard.mission}</label>
                  <select id="am" className="input" value={mission} onChange={(e) => { setMission(e.target.value); setDate(""); }}>
                    <option value="">—</option>
                    {MISSIONS.filter((m) => m.type !== "mission").map((m) => <option key={m.slug} value={m.slug}>{tr(m.country, locale)} — {tr(m.city, locale)}</option>)}
                  </select></div>
                <div><label className="label" htmlFor="as">{t.wizard.service}</label>
                  <select id="as" className="input" value={service} onChange={(e) => setService(e.target.value)}>
                    {SERVICES.filter((s) => s.inPerson).map((s) => <option key={s.slug} value={s.slug}>{tr(s.title, locale)}</option>)}
                  </select></div>
              </div>
              {mission && <div><div className="label">{t.appt.pick}</div><Calendar mission={mission} value={date} onPick={setDate} /></div>}
              {date && (
                <div><div className="label">{t.appt.slots}</div>
                  {!slots ? <Loader2 className="h-5 w-5 animate-spin text-navy-300" /> : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {slots.map((s) => (
                        <button key={s.time} disabled={!s.left} onClick={() => setTime(s.time)} aria-pressed={time === s.time}
                          className={`rounded-xl border py-2 text-center font-mono text-sm ${time === s.time ? "border-emerald-500 bg-emerald-500 text-white" : !s.left ? "border-transparent bg-ivory-200/50 text-navy-300/50 line-through" : "border-navy-700/10 hover:border-gold-500"}`} dir="ltr">
                          {s.time}<div className="font-sans text-[10px] opacity-70">{s.left ? `${s.left}` : t.appt.full}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {time && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="label" htmlFor="an">{t.appt.name}</label><input id="an" className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div><label className="label" htmlFor="ac">{t.wizard.email} / {t.wizard.phone.split(" ")[0]}</label><input id="ac" className="input" dir="ltr" value={contact} onChange={(e) => setContact(e.target.value)} /></div>
                  {err && <p className="text-sm text-flag-red sm:col-span-2" role="alert">{err}</p>}
                  <button className="btn-gold sm:col-span-2" disabled={busy || name.length < 3 || contact.length < 5} onClick={reserve}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{t.appt.reserve}</button>
                </div>
              )}
            </div>
          )}
        </section>

        <section id="manage" className="card h-fit scroll-mt-32 p-6">
          <h2 className="mb-4 text-lg font-bold">{t.appt.manage}</h2>
          <form onSubmit={find} className="flex gap-2"><input className="input font-mono" dir="ltr" placeholder="APT-000000" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} aria-label={t.appt.code} /><button className="btn-dark !px-4" aria-label={t.appt.find}><Search className="h-4 w-4" /></button></form>
          {!booked && err && !time && <p className="mt-2 text-sm text-flag-red">{err}</p>}
          {found && (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-ivory-50 p-4 text-sm"><div className="font-semibold">{tr(getService(found.service)?.title, locale)}</div><div className="text-navy-300">{fmtDate(found.date, locale, { dateStyle: "full" })} · <span dir="ltr">{found.time}</span></div>{found.status === "cancelled" && <span className="chip mt-2 bg-red-50 text-flag-red">{t.appt.cancelled}</span>}</div>
              {found.status === "booked" && (
                <>
                  <div className="label">{t.appt.reschedule}</div>
                  <input type="date" className="input" value={resDate} min={iso(new Date(Date.now() + 864e5))} onChange={(e) => setResDate(e.target.value)} />
                  {resSlots && (resSlots.length ? <div className="grid grid-cols-4 gap-1.5">{resSlots.filter((s) => s.left).map((s) => <button key={s.time} onClick={() => patch({ action: "reschedule", date: resDate, time: s.time })} className="rounded-lg border border-navy-700/10 py-1.5 font-mono text-xs hover:border-emerald-500" dir="ltr">{s.time}</button>)}</div> : <p className="text-xs text-navy-300">{t.appt.closed}</p>)}
                  <button className="btn w-full border border-flag-red/30 text-flag-red hover:bg-red-50" onClick={() => patch({ action: "cancel" })}>{t.appt.cancel}</button>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default function Page() {
  return <Suspense><Appointments /></Suspense>;
}
