"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, FileText, History, Inbox, Search, CheckCircle2, XCircle, PencilLine } from "lucide-react";
import { DashShell, Stat, Bars } from "@/components/dash-shell";
import { useApp } from "@/components/providers";
import { Flag } from "@/components/brand";
import { api } from "@/lib/client";
import { getService, SERVICES } from "@/lib/data/services";
import { getMission } from "@/lib/data/missions";
import { fmtDate, tr } from "@/lib/i18n";

type Status = "submitted" | "under_review" | "correction_requested" | "approved" | "rejected" | "ready_for_pickup" | "dispatched" | "completed";
type App = { tracking: string; fullName: string; passport: string; dob: string; contact: string; nationalIdLast4: string; service: string; mission: string; status: Status; createdAt: string; files: { name: string; type: string; size: number }[]; history: { at: string; status: Status; by: string }[]; messages: { at: string; ar: string; en: string }[] };
type Data = { session: { sub: string; name: string; role: string; mission?: string }; applications: App[]; appointments: { code: string; date: string; time: string; name: string; service: string; status: string }[]; capacity: number | null; holidays: { date: string; name: string }[]; activity: { at: string; actor: string; action: string; target: string }[] };

const TEMPLATES = [
  { id: "photo", ar: "يرجى رفع صورة شخصية حديثة بخلفية بيضاء.", en: "Please upload a recent photo with a white background." },
  { id: "legal", ar: "يرجى رفع نسخة مصدّقة ومترجمة من الوثيقة.", en: "Please upload a legalized and translated copy of the document." },
  { id: "ready", ar: "وثيقتك جاهزة للاستلام من البعثة خلال ساعات العمل مع إبراز الإيصال.", en: "Your document is ready for collection at the mission during working hours; please bring your receipt." },
  { id: "approved", ar: "تمت الموافقة على طلبك وسيتم إعلامك عند الجاهزية.", en: "Your application has been approved; you will be notified when it is ready." },
];
const STATUSES: Status[] = ["submitted", "under_review", "correction_requested", "approved", "rejected", "ready_for_pickup", "dispatched", "completed"];

export default function MissionDashboard() {
  const { locale, t } = useApp();
  const [tab, setTab] = useState("apps");
  const [d, setD] = useState<Data | null>(null);
  const [q, setQ] = useState("");
  const [fs, setFs] = useState<Status | "">("");
  const [fsvc, setFsvc] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [tpl, setTpl] = useState(TEMPLATES[0]);
  const [doc, setDoc] = useState(0);
  const [cap, setCap] = useState(0);
  const [hol, setHol] = useState({ date: "", name: "" });

  const load = useCallback(async () => {
    const r = await api<Data>("/api/staff/applications");
    if (r.ok) { setD(r.data); setCap(r.data.capacity ?? 0); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const apps = useMemo(() => (d?.applications ?? []).filter((a) => (!fs || a.status === fs) && (!fsvc || a.service === fsvc) && (!q || `${a.tracking} ${a.fullName}`.toLowerCase().includes(q.toLowerCase()))), [d, fs, fsvc, q]);
  const cur = d?.applications.find((a) => a.tracking === sel);
  const mission = getMission(d?.session.mission ?? "");

  async function act(action: Status, withMsg = true) {
    if (!cur) return;
    await api(`/api/staff/applications/${cur.tracking}`, { method: "PATCH", json: withMsg ? { action, messageAr: tpl.ar, messageEn: tpl.en } : { action } });
    load();
  }
  async function missionAct(body: object) {
    if (!d?.session.mission) return;
    await api("/api/staff/mission", { method: "POST", json: { mission: d.session.mission, ...body } });
    load();
  }

  const tabs = [
    { id: "apps", label: t.dash.incoming, icon: Inbox },
    { id: "cal", label: t.dash.calendar, icon: CalendarDays },
    { id: "stats", label: t.dash.stats, icon: BarChart3 },
    { id: "log", label: t.dash.activity, icon: History },
  ];
  const statusChip = (s: Status) => <span className={`chip ${s === "rejected" ? "bg-red-50 text-flag-red" : s === "correction_requested" ? "bg-gold-100 text-gold-700" : s === "submitted" ? "bg-navy-700/5 text-navy-500" : "bg-emerald-50 text-emerald-600"}`}>{t.status[s]}</span>;

  return (
    <DashShell title={`${t.dash.mission}${mission ? ` — ${tr(mission.city, locale)}` : ""}`} user={d?.session.name} tabs={tabs} tab={tab} setTab={setTab}>
      {!d ? <div className="card p-10 text-center text-navy-300">{t.common.loading}</div> : (
        <>
          {tab === "apps" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <Stat label={t.status.submitted} value={d.applications.filter((a) => a.status === "submitted").length} accent="navy" />
                <Stat label={t.status.under_review} value={d.applications.filter((a) => a.status === "under_review").length} />
                <Stat label={t.status.correction_requested} value={d.applications.filter((a) => a.status === "correction_requested").length} accent="gold" />
                <Stat label={t.status.ready_for_pickup} value={d.applications.filter((a) => a.status === "ready_for_pickup").length} />
              </div>
              <div className="card flex flex-wrap gap-2 p-3">
                <div className="flex min-w-[200px] flex-1 items-center gap-2 px-2"><Search className="h-4 w-4 text-navy-300" /><input className="h-10 flex-1 bg-transparent text-sm outline-none" placeholder={`${t.tracker.tracking} / ${t.dash.citizen}`} value={q} onChange={(e) => setQ(e.target.value)} /></div>
                <select className="input !w-auto !py-2" value={fs} onChange={(e) => setFs(e.target.value as Status)}><option value="">{t.dash.allStatuses}</option>{STATUSES.map((s) => <option key={s} value={s}>{t.status[s]}</option>)}</select>
                <select className="input !w-auto !py-2" value={fsvc} onChange={(e) => setFsvc(e.target.value)}><option value="">{t.dash.allServices}</option>{SERVICES.map((s) => <option key={s.slug} value={s.slug}>{tr(s.title, locale)}</option>)}</select>
              </div>
              <div className={`grid gap-4 ${cur ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]" : ""}`}>
                <div className="card divide-y divide-navy-700/5 overflow-hidden">
                  {apps.map((a) => (
                    <button key={a.tracking} onClick={() => { setSel(a.tracking); setDoc(0); }} className={`flex w-full items-center gap-3 p-4 text-start transition hover:bg-ivory-50 ${sel === a.tracking ? "bg-emerald-50/60" : ""}`}>
                      <div className="min-w-0 flex-1"><div className="font-semibold">{a.fullName}</div><div className="truncate text-xs text-navy-300"><span className="font-mono" dir="ltr">{a.tracking}</span> · {tr(getService(a.service)?.title, locale)}</div></div>
                      {statusChip(a.status)}
                    </button>
                  ))}
                  {!apps.length && <div className="p-8 text-center text-sm text-navy-300">—</div>}
                </div>
                {cur && (
                  <div className="card overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-700/10 p-4"><div><div className="font-bold">{cur.fullName}</div><div className="font-mono text-xs text-navy-300" dir="ltr">{cur.tracking}</div></div>{statusChip(cur.status)}</div>
                    <div className="grid gap-0 md:grid-cols-2">
                      {/* Side-by-side: document viewer | citizen info */}
                      <div className="border-navy-700/10 p-4 md:border-e">
                        <div className="mb-2 flex gap-1 overflow-x-auto">{cur.files.map((f, i) => <button key={i} onClick={() => setDoc(i)} className={`chip shrink-0 ${doc === i ? "bg-navy-700 text-white" : "bg-ivory"}`}><FileText className="h-3 w-3" />{f.name}</button>)}</div>
                        <div className="pattern relative grid aspect-[3/4] place-items-center overflow-hidden rounded-xl border border-navy-700/10 bg-white">
                          <div className="w-3/4 space-y-2 rounded-lg bg-white p-4 shadow-gov">
                            <div className="flex items-center justify-between"><Flag className="h-4 w-auto" /><span className="text-[9px] text-navy-300">{cur.files[doc]?.type}</span></div>
                            <div className="h-2 w-2/3 rounded bg-navy-700/20" /><div className="h-2 w-1/2 rounded bg-navy-700/10" />
                            <div className="mt-3 h-16 rounded bg-ivory-200" /><div className="h-2 rounded bg-navy-700/10" /><div className="h-2 w-5/6 rounded bg-navy-700/10" />
                            <div className="pt-2 text-center text-[10px] text-navy-300">{cur.files[doc]?.name} · {((cur.files[doc]?.size ?? 0) / 1024).toFixed(0)} KB</div>
                          </div>
                          <span className="absolute bottom-2 start-2 text-[10px] text-navy-300">{locale === "ar" ? "معاينة آمنة — يتم فك التشفير عند العرض" : "Secure preview — decrypted on view"}</span>
                        </div>
                      </div>
                      <div className="space-y-4 p-4">
                        <dl className="grid grid-cols-2 gap-3 text-sm">
                          {[[t.wizard.service, tr(getService(cur.service)?.title, locale)], [t.wizard.nationalId, `•••••••${cur.nationalIdLast4}`], [t.wizard.passport, cur.passport || "—"], [t.wizard.dob, cur.dob], [t.wizard.channel, cur.contact], [locale === "ar" ? "تاريخ التقديم" : "Submitted", fmtDate(cur.createdAt, locale, { dateStyle: "medium" })]].map(([k, v]) => <div key={k}><dt className="text-[11px] text-navy-300">{k}</dt><dd className="truncate font-medium" dir="auto">{v}</dd></div>)}
                        </dl>
                        <div>
                          <label className="label">{t.dash.template}</label>
                          <select className="input !py-2" value={tpl.id} onChange={(e) => setTpl(TEMPLATES.find((x) => x.id === e.target.value)!)}>{TEMPLATES.map((x) => <option key={x.id} value={x.id}>{locale === "ar" ? x.ar : x.en}</option>)}</select>
                          <div className="mt-2 grid gap-2 rounded-xl bg-ivory-50 p-3 text-xs"><p dir="rtl" lang="ar">{tpl.ar}</p><p dir="ltr" lang="en">{tpl.en}</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button className="btn-primary !py-2" onClick={() => act("approved", tpl.id === "approved")}><CheckCircle2 className="h-4 w-4" />{t.dash.approve}</button>
                          <button className="btn !py-2 border border-gold-500 text-gold-700 hover:bg-gold-100" onClick={() => act("correction_requested")}><PencilLine className="h-4 w-4" />{t.dash.correction}</button>
                          <button className="btn !py-2 border border-flag-red/30 text-flag-red hover:bg-red-50" onClick={() => act("rejected")}><XCircle className="h-4 w-4" />{t.dash.reject}</button>
                          <select className="input !py-2 text-xs" value="" onChange={(e) => e.target.value && act(e.target.value as Status, e.target.value === "ready_for_pickup")}>
                            <option value="">{locale === "ar" ? "تحديث الحالة…" : "Set status…"}</option>{(["under_review", "ready_for_pickup", "dispatched", "completed"] as Status[]).map((s) => <option key={s} value={s}>{t.status[s]}</option>)}
                          </select>
                        </div>
                        <ol className="space-y-1 border-t border-navy-700/10 pt-3 text-xs text-navy-300">{[...cur.history].reverse().slice(0, 5).map((h, i) => <li key={i}>{fmtDate(h.at, locale, { dateStyle: "short", timeStyle: "short" })} — <b className="text-navy-500">{t.status[h.status]}</b> · {h.by}</li>)}</ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "cal" && (
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="card p-5">
                <h2 className="mb-4 font-bold">{t.dash.calendar}</h2>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 12 }, (_, i) => { const dt = new Date(Date.now() + (i + 1) * 864e5); const k = dt.toISOString().slice(0, 10); const list = d.appointments.filter((a) => a.date === k && a.status === "booked"); const closed = !mission?.workdays.includes(dt.getDay()) || d.holidays.some((h) => h.date === k);
                    return <div key={k} className={`rounded-xl border p-3 ${closed ? "border-transparent bg-ivory-200/50 text-navy-300" : "border-navy-700/10"}`}><div className="flex justify-between text-sm font-semibold"><span>{fmtDate(dt, locale, { weekday: "short", day: "numeric", month: "short" })}</span><span>{closed ? t.appt.closed : `${list.length}/${d.capacity}`}</span></div>{list.map((a) => <div key={a.code} className="mt-1 truncate text-xs"><span className="font-mono" dir="ltr">{a.time}</span> {a.name}</div>)}</div>; })}
                </div>
              </div>
              <div className="space-y-4">
                <div className="card p-5"><h3 className="mb-3 font-bold">{t.dash.capacity}</h3><div className="flex gap-2"><input type="number" min={0} max={500} className="input" value={cap} onChange={(e) => setCap(+e.target.value)} /><button className="btn-primary" onClick={() => missionAct({ action: "capacity", value: cap })}>{t.dash.save}</button></div></div>
                <div className="card p-5"><h3 className="mb-3 font-bold">{t.dash.holidays}</h3>
                  <div className="space-y-2"><input type="date" className="input" value={hol.date} onChange={(e) => setHol({ ...hol, date: e.target.value })} /><input className="input" placeholder={locale === "ar" ? "اسم العطلة" : "Holiday name"} value={hol.name} onChange={(e) => setHol({ ...hol, name: e.target.value })} /><button className="btn-primary w-full" disabled={!hol.date || hol.name.length < 2} onClick={() => { missionAct({ action: "holiday", ...hol }); setHol({ date: "", name: "" }); }}>{t.dash.save}</button></div>
                  <ul className="mt-3 space-y-1 text-sm">{[...(mission?.holidays.map((h) => ({ date: h.date, name: tr(h.name, locale), fixed: true })) ?? []), ...d.holidays.map((h) => ({ ...h, fixed: false }))].map((h) => <li key={h.date + h.name} className="flex items-center justify-between gap-2"><span>{h.name}</span><span className="flex items-center gap-2 text-xs text-navy-300">{h.date}{!h.fixed && <button className="text-flag-red" onClick={() => missionAct({ action: "holiday-remove", date: h.date })} aria-label="Remove">×</button>}</span></li>)}</ul>
                </div>
              </div>
            </div>
          )}

          {tab === "stats" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card p-5"><h3 className="mb-4 font-bold">{t.dash.allStatuses}</h3><Bars data={d.applications.reduce<Record<string, number>>((m, a) => ({ ...m, [a.status]: (m[a.status] ?? 0) + 1 }), {})} labels={t.status} /></div>
              <div className="card p-5"><h3 className="mb-4 font-bold">{t.dash.allServices}</h3><Bars data={d.applications.reduce<Record<string, number>>((m, a) => ({ ...m, [a.service]: (m[a.service] ?? 0) + 1 }), {})} labels={Object.fromEntries(SERVICES.map((s) => [s.slug, tr(s.title, locale)]))} /></div>
            </div>
          )}

          {tab === "log" && (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm"><thead className="bg-ivory-50 text-xs text-navy-300"><tr><th className="p-3 text-start">Time</th><th className="p-3 text-start">Actor</th><th className="p-3 text-start">Action</th><th className="p-3 text-start">Target</th></tr></thead>
                <tbody>{d.activity.map((e, i) => <tr key={i} className="border-t border-navy-700/5"><td className="p-3 text-navy-300">{fmtDate(e.at, locale, { dateStyle: "short", timeStyle: "medium" })}</td><td className="p-3">{e.actor}</td><td className="p-3 font-mono text-xs">{e.action}</td><td className="p-3 font-mono text-xs" dir="ltr">{e.target}</td></tr>)}</tbody></table>
            </div>
          )}
        </>
      )}
    </DashShell>
  );
}
