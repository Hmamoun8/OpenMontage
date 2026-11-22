"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Bell, BellRing, Check, Loader2, MessageSquare, X } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { useApp } from "@/components/providers";
import { api } from "@/lib/client";
import { getService } from "@/lib/data/services";
import { getMission } from "@/lib/data/missions";
import { fmtDate, tr } from "@/lib/i18n";

type Status = "submitted" | "under_review" | "correction_requested" | "approved" | "rejected" | "ready_for_pickup" | "dispatched" | "completed";
type App = { tracking: string; fullName: string; service: string; mission: string; status: Status; createdAt: string; history: { at: string; status: Status; by: string; note?: string }[]; messages: { at: string; from: string; ar: string; en: string }[] };
const FLOW: Status[] = ["submitted", "under_review", "approved", "ready_for_pickup", "dispatched", "completed"];

function Tracker() {
  const { locale, t } = useApp();
  const sp = useSearchParams();
  const [n, setN] = useState(sp.get("n") ?? "");
  const [nid, setNid] = useState("");
  const [busy, setBusy] = useState(false);
  const [a, setA] = useState<App | null>(null);
  const [err, setErr] = useState("");
  const [notify, setNotify] = useState(false);

  useEffect(() => { try { setNotify(!!a && localStorage.getItem(`mofa-notify-${a.tracking}`) === "1"); } catch {} }, [a]);

  async function check(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await api<App>("/api/track", { method: "POST", json: { tracking: n.trim(), nationalId: nid.trim() } });
    setBusy(false);
    if (!r.ok) { setA(null); setErr(t.tracker.notFound); return; }
    setA(r.data);
  }
  async function toggleNotify() {
    if (!a) return;
    if (!notify && "Notification" in window && Notification.permission === "default") await Notification.requestPermission();
    const v = !notify; setNotify(v);
    try { localStorage.setItem(`mofa-notify-${a.tracking}`, v ? "1" : "0"); } catch {}
  }

  const branch = a && (a.status === "correction_requested" || a.status === "rejected");
  const steps: Status[] = branch ? ["submitted", "under_review", a!.status] : FLOW;
  const cur = a ? steps.indexOf(a.status) : -1;

  return (
    <>
      <PageHero eyebrow={t.nav.services} title={t.tracker.title} lead={t.tracker.lead}>
        <form onSubmit={check} className="glass grid max-w-3xl gap-3 rounded-2xl p-3 text-navy-700 sm:grid-cols-[1.3fr_1fr_auto]">
          <input className="input font-mono" dir="ltr" placeholder="SY-MOFA-2026-XXXXX" value={n} onChange={(e) => setN(e.target.value.toUpperCase())} aria-label={t.tracker.tracking} required />
          <input className="input font-mono" dir="ltr" inputMode="numeric" maxLength={11} placeholder={t.tracker.nationalId} value={nid} onChange={(e) => setNid(e.target.value.replace(/\D/g, ""))} aria-label={t.tracker.nationalId} required />
          <button className="btn-gold" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{t.tracker.check}</button>
        </form>
        <p className="mt-3 text-xs text-white/50">{t.tracker.demo}</p>
      </PageHero>

      <div className="container-gov py-12">
        {err && <div className="card flex items-center gap-3 border-flag-red/30 p-5 text-flag-red" role="alert"><AlertTriangle className="h-5 w-5" />{err}</div>}
        {a && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <section className="card p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><div className="font-mono text-sm text-navy-300" dir="ltr">{a.tracking}</div><h2 className="mt-1 text-2xl font-bold">{tr(getService(a.service)?.title, locale)}</h2><p className="text-navy-300">{tr(getMission(a.mission)?.city, locale)} · {a.fullName}</p></div>
                  <span className={`chip px-4 py-2 text-sm ${a.status === "rejected" ? "bg-red-50 text-flag-red" : a.status === "correction_requested" ? "bg-gold-100 text-gold-700" : "bg-emerald-50 text-emerald-600"}`}>{t.status[a.status]}</span>
                </div>
                <h3 className="mb-6 mt-10 text-sm font-semibold text-navy-300">{t.tracker.timeline}</h3>
                <ol className="relative grid gap-6 sm:grid-cols-6 sm:gap-2" style={{ gridTemplateColumns: undefined }}>
                  <div className="absolute start-5 top-5 hidden h-1 w-[calc(100%-2.5rem)] rounded bg-navy-700/10 sm:block" />
                  <motion.div className="absolute start-5 top-5 hidden h-1 rounded bg-gradient-to-r from-emerald-500 to-gold-500 sm:block rtl:bg-gradient-to-l" initial={{ width: 0 }} animate={{ width: `calc(${(Math.max(cur, 0) / (steps.length - 1)) * 100}% - ${(Math.max(cur, 0) / (steps.length - 1)) * 2.5}rem)` }} transition={{ duration: 1.2, ease: "easeOut" }} />
                  {steps.map((s, i) => {
                    const done = i < cur || (i === cur && s === "completed");
                    const now = i === cur;
                    const bad = now && (s === "rejected" || s === "correction_requested");
                    return (
                      <li key={s} className={`relative flex items-center gap-3 sm:flex-col sm:text-center ${steps.length === 3 ? "sm:col-span-2" : ""}`}>
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.12 }} className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-4 border-white shadow ${bad ? "bg-gold-500 text-white" : done ? "bg-emerald-500 text-white" : now ? "bg-gold-500 text-navy-900 ring-4 ring-gold-500/30" : "bg-ivory-200 text-navy-300"}`}>
                          {bad ? (s === "rejected" ? <X className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />) : done ? <Check className="h-4 w-4" /> : i + 1}
                        </motion.span>
                        <span className={`text-sm ${now ? "font-bold" : "text-navy-300"}`}>{t.status[s]}</span>
                      </li>
                    );
                  })}
                </ol>
              </section>
              <section className="card p-6 sm:p-8">
                <h3 className="mb-4 flex items-center gap-2 font-bold"><MessageSquare className="h-5 w-5 text-emerald-500" />{t.tracker.messages}</h3>
                {a.messages.length ? a.messages.map((m, i) => (
                  <div key={i} className="mb-3 rounded-2xl rounded-ss-sm bg-ivory-50 p-4"><p>{locale === "ar" ? m.ar : m.en}</p><time className="mt-1 block text-xs text-navy-300">{fmtDate(m.at, locale, { dateStyle: "medium", timeStyle: "short" })}</time></div>
                )) : <p className="text-sm text-navy-300">—</p>}
              </section>
            </div>
            <aside className="space-y-4">
              <button onClick={toggleNotify} className={`card flex w-full items-center gap-3 p-5 text-start ${notify ? "border-emerald-500/40 bg-emerald-50" : ""}`}>{notify ? <BellRing className="h-5 w-5 text-emerald-600" /> : <Bell className="h-5 w-5 text-navy-300" />}<span className="font-semibold">{notify ? t.tracker.notifyOn : t.tracker.notify}</span></button>
              <section className="card p-5">
                <h3 className="mb-4 font-bold">{t.tracker.history}</h3>
                <ol className="space-y-4 border-s-2 border-navy-700/10 ps-5">
                  {[...a.history].reverse().map((h, i) => (
                    <li key={i} className="relative"><span className="absolute -start-[27px] top-1.5 h-3 w-3 rounded-full bg-gold-500 ring-4 ring-white" /><div className="text-sm font-semibold">{t.status[h.status]}</div><time className="text-xs text-navy-300">{fmtDate(h.at, locale, { dateStyle: "medium", timeStyle: "short" })}</time></li>
                  ))}
                </ol>
              </section>
            </aside>
          </motion.div>
        )}
      </div>
    </>
  );
}

export default function Page() {
  return <Suspense><Tracker /></Suspense>;
}
