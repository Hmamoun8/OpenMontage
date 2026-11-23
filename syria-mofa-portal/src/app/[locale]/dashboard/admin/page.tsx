"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Building2, FileClock, Gauge, Megaphone, ShieldCheck, Users, Wallet } from "lucide-react";
import { Bars, DashShell, Stat } from "@/components/dash-shell";
import { useApp } from "@/components/providers";
import { api } from "@/lib/client";
import { getMission, MISSIONS } from "@/lib/data/missions";
import { SERVICES } from "@/lib/data/services";
import { fmtDate, tr } from "@/lib/i18n";

type Staff = { username: string; name: string; role: string; mission?: string; active: boolean; permissions: string[] };
type Data = {
  totals: { applications: number; appointments: number; missions: number; staff: number };
  byStatus: Record<string, number>; byService: Record<string, number>;
  performance: { mission: string; total: number; decided: number; capacity: number }[];
  fees: Record<string, number>; statements: { at: string; title: string; titleAr: string; by: string }[];
  staff: Staff[]; audit: { at: string; actor: string; action: string; target: string; ip?: string }[];
};
const PERMS = ["applications.review", "applications.decide", "appointments.manage", "content.publish", "fees.edit", "staff.manage"];

export default function AdminDashboard() {
  const { locale, t } = useApp();
  const [tab, setTab] = useState("overview");
  const [d, setD] = useState<Data | null>(null);
  const [fees, setFees] = useState<Record<string, number>>({});
  const [nu, setNu] = useState({ username: "", name: "", role: "officer", mission: "berlin" });
  const [st, setSt] = useState({ title: "", titleAr: "" });
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => { const r = await api<Data>("/api/admin"); if (r.ok) { setD(r.data); setFees(r.data.fees); } }, []);
  useEffect(() => { load(); }, [load]);
  async function post(body: object) {
    const r = await api("/api/admin", { method: "POST", json: body });
    setMsg(r.ok ? "✓" : r.data.error ?? "error"); setTimeout(() => setMsg(""), 2000);
    load();
  }

  const tabs = [
    { id: "overview", label: t.dash.stats, icon: Gauge },
    { id: "missions", label: t.dash.missions, icon: Building2 },
    { id: "staff", label: t.dash.staff, icon: Users },
    { id: "fees", label: t.dash.fees, icon: Wallet },
    { id: "content", label: t.dash.content, icon: Megaphone },
    { id: "audit", label: t.dash.audit, icon: ShieldCheck },
  ];

  return (
    <DashShell title={t.dash.admin} user="admin" tabs={tabs} tab={tab} setTab={setTab}>
      {msg && <div className="fixed bottom-24 start-1/2 z-50 -translate-x-1/2 rounded-xl bg-navy-700 px-4 py-2 text-sm text-white shadow-gov">{msg}</div>}
      {!d ? <div className="card p-10 text-center text-navy-300">{t.common.loading}</div> : (
        <>
          {tab === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <Stat label={t.dash.incoming} value={d.totals.applications} /><Stat label={t.nav.appointments} value={d.totals.appointments} accent="gold" />
                <Stat label={t.dash.missions} value={d.totals.missions} accent="navy" /><Stat label={t.dash.staff} value={d.totals.staff} accent="navy" />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="card p-5"><h3 className="mb-4 font-bold">{t.dash.allStatuses}</h3><Bars data={d.byStatus} labels={t.status} /></div>
                <div className="card p-5"><h3 className="mb-4 font-bold">{t.dash.allServices}</h3><Bars data={d.byService} labels={Object.fromEntries(SERVICES.map((s) => [s.slug, tr(s.title, locale)]))} /></div>
              </div>
              <div className="card overflow-x-auto p-5">
                <h3 className="mb-4 font-bold">{t.dash.performance}</h3>
                <table className="w-full text-sm"><thead className="text-xs text-navy-300"><tr><th className="pb-2 text-start">{t.wizard.mission}</th><th className="pb-2 text-start">{t.dash.incoming}</th><th className="pb-2 text-start">{locale === "ar" ? "نسبة الإنجاز" : "Decision rate"}</th><th className="pb-2 text-start">{t.dash.capacity}</th></tr></thead>
                  <tbody>{d.performance.map((p) => { const rate = Math.round((p.decided / p.total) * 100); return <tr key={p.mission} className="border-t border-navy-700/5"><td className="py-2 font-medium">{tr(getMission(p.mission)?.city, locale)}</td><td>{p.total}</td><td><div className="flex items-center gap-2"><span className="h-2 w-24 overflow-hidden rounded-full bg-ivory-200"><span className="block h-full bg-emerald-500" style={{ width: `${rate}%` }} /></span>{rate}%</div></td><td>{p.capacity}</td></tr>; })}</tbody></table>
              </div>
            </div>
          )}

          {tab === "missions" && (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm"><thead className="bg-ivory-50 text-xs text-navy-300"><tr><th className="p-3 text-start">{t.wizard.mission}</th><th className="p-3 text-start">{t.embassies.type}</th><th className="p-3 text-start">{t.embassies.region}</th><th className="p-3 text-start">{t.dash.capacity}</th><th /></tr></thead>
                <tbody>{MISSIONS.map((m) => <tr key={m.slug} className="border-t border-navy-700/5"><td className="p-3 font-medium">{tr(m.city, locale)} <span className="text-navy-300">· {tr(m.country, locale)}</span></td><td className="p-3">{t.embassies[m.type]}</td><td className="p-3 text-navy-300">{t.embassies.regions[m.region]}</td><td className="p-3">{m.dailyCapacity}</td><td className="p-3"><Link href={`/${locale}/embassies/${m.slug}`} className="text-emerald-600">{t.common.learnMore}</Link></td></tr>)}</tbody></table>
            </div>
          )}

          {tab === "staff" && (
            <div className="space-y-4">
              <div className="card grid gap-2 p-5 sm:grid-cols-5">
                <input className="input" placeholder={t.dash.username} dir="ltr" value={nu.username} onChange={(e) => setNu({ ...nu, username: e.target.value.toLowerCase() })} />
                <input className="input" placeholder={t.appt.name} value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} />
                <select className="input" value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })}><option value="officer">officer</option><option value="admin">admin</option></select>
                <select className="input" value={nu.mission} onChange={(e) => setNu({ ...nu, mission: e.target.value })} disabled={nu.role === "admin"}>{MISSIONS.map((m) => <option key={m.slug} value={m.slug}>{tr(m.city, locale)}</option>)}</select>
                <button className="btn-primary" onClick={() => { post({ action: "staff-create", ...nu, mission: nu.role === "admin" ? undefined : nu.mission }); setNu({ ...nu, username: "", name: "" }); }}>+ {t.dash.save}</button>
              </div>
              <div className="card divide-y divide-navy-700/5">
                {d.staff.map((u) => (
                  <div key={u.username} className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-[180px] flex-1"><div className="font-semibold">{u.name}</div><div className="font-mono text-xs text-navy-300" dir="ltr">{u.username} · {u.role}{u.mission ? ` · ${u.mission}` : ""}</div></div>
                    <div className="flex flex-wrap gap-1">{u.permissions.includes("*") ? <span className="chip bg-navy-700 text-white">*</span> : PERMS.map((p) => (
                      <button key={p} onClick={() => post({ action: "staff-permissions", username: u.username, permissions: u.permissions.includes(p) ? u.permissions.filter((x) => x !== p) : [...u.permissions, p] })} className={`chip ${u.permissions.includes(p) ? "bg-emerald-50 text-emerald-600" : "bg-ivory text-navy-300"}`}>{p}</button>
                    ))}</div>
                    <button onClick={() => post({ action: "staff-toggle", username: u.username })} className={`chip ${u.active ? "bg-emerald-500 text-white" : "bg-red-50 text-flag-red"}`}>{u.active ? "active" : "disabled"}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "fees" && (
            <div className="card divide-y divide-navy-700/5">
              {SERVICES.map((s) => (
                <div key={s.slug} className="flex items-center gap-3 p-3">
                  <span className="flex-1 text-sm font-medium">{tr(s.title, locale)}</span>
                  <span className="text-xs text-navy-300">USD</span>
                  <input type="number" min={0} className="input !w-28 !py-2" value={fees[s.slug] ?? 0} onChange={(e) => setFees({ ...fees, [s.slug]: +e.target.value })} />
                  <button className="btn-ghost !py-2" disabled={fees[s.slug] === d.fees[s.slug]} onClick={() => post({ action: "fee", service: s.slug, value: fees[s.slug] })}>{t.dash.save}</button>
                </div>
              ))}
            </div>
          )}

          {tab === "content" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card space-y-3 p-5">
                <h3 className="font-bold">{t.dash.statements}</h3>
                <input className="input" dir="rtl" lang="ar" placeholder="العنوان بالعربية" value={st.titleAr} onChange={(e) => setSt({ ...st, titleAr: e.target.value })} />
                <input className="input" dir="ltr" lang="en" placeholder="Title in English" value={st.title} onChange={(e) => setSt({ ...st, title: e.target.value })} />
                <button className="btn-primary w-full" disabled={st.title.length < 3 || st.titleAr.length < 3} onClick={() => { post({ action: "statement", ...st }); setSt({ title: "", titleAr: "" }); }}><Megaphone className="h-4 w-4" />{t.dash.statements}</button>
              </div>
              <div className="card p-5">
                <h3 className="mb-3 font-bold">{t.home.news}</h3>
                <ul className="space-y-2 text-sm">{d.statements.map((s, i) => <li key={i} className="rounded-xl bg-ivory-50 p-3"><div className="font-semibold">{locale === "ar" ? s.titleAr : s.title}</div><div className="text-xs text-navy-300">{fmtDate(s.at, locale, { dateStyle: "medium", timeStyle: "short" })} · {s.by}</div></li>)}{!d.statements.length && <li className="text-navy-300">—</li>}</ul>
              </div>
            </div>
          )}

          {tab === "audit" && (
            <div className="card overflow-x-auto">
              <div className="flex items-center gap-2 border-b border-navy-700/10 p-4 text-sm font-semibold"><FileClock className="h-4 w-4 text-emerald-500" />{t.dash.audit}</div>
              <table className="w-full text-sm"><thead className="bg-ivory-50 text-xs text-navy-300"><tr><th className="p-3 text-start">Time</th><th className="p-3 text-start">Actor</th><th className="p-3 text-start">Action</th><th className="p-3 text-start">Target</th><th className="p-3 text-start">IP</th></tr></thead>
                <tbody>{d.audit.map((e, i) => <tr key={i} className={`border-t border-navy-700/5 ${e.action.includes("failed") ? "bg-red-50/50" : ""}`}><td className="p-3 text-navy-300">{fmtDate(e.at, locale, { dateStyle: "short", timeStyle: "medium" })}</td><td className="p-3">{e.actor}</td><td className="p-3 font-mono text-xs">{e.action}</td><td className="p-3 font-mono text-xs" dir="ltr">{e.target}</td><td className="p-3 font-mono text-xs text-navy-300">{e.ip}</td></tr>)}</tbody></table>
            </div>
          )}
        </>
      )}
    </DashShell>
  );
}
