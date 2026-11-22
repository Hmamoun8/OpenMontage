"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "qrcode";
import { Check, FileText, Loader2, ShieldCheck, Trash2, UploadCloud, Save } from "lucide-react";
import { useApp } from "./providers";
import { api } from "@/lib/client";
import { MISSIONS } from "@/lib/data/missions";
import { getService, SERVICES } from "@/lib/data/services";
import { tr } from "@/lib/i18n";

const MAX = 5 * 1024 * 1024;
type Up = { file: File; url: string; kind: "pdf" | "jpg" };
type Draft = { step: number; country: string; mission: string; service: string; fullName: string; nationalId: string; passport: string; dob: string; channel: "email" | "sms"; contact: string };
const EMPTY: Draft = { step: 0, country: "", mission: "", service: "", fullName: "", nationalId: "", passport: "", dob: "", channel: "email", contact: "" };
const KEY = "mofa-draft";

async function sniff(f: File): Promise<"pdf" | "jpg" | null> {
  const b = new Uint8Array(await f.slice(0, 4).arrayBuffer());
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "pdf";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  return null;
}

export function Wizard() {
  const { locale, t } = useApp();
  const sp = useSearchParams();
  const [d, setD] = useState<Draft>(EMPTY);
  const [hasDraft, setHasDraft] = useState(false);
  const [files, setFiles] = useState<Record<number, Up>>({});
  const [err, setErr] = useState<Record<string, string>>({});
  const [otpSent, setOtpSent] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ tracking: string; qr: string; createdAt: string } | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    try { if (localStorage.getItem(KEY)) setHasDraft(true); } catch {}
    const svc = sp.get("service"), m = sp.get("mission");
    const mission = MISSIONS.find((x) => x.slug === m);
    setD((cur) => ({ ...cur, service: svc && getService(svc) ? svc : cur.service, mission: mission?.slug ?? cur.mission, country: mission?.countryCode ?? cur.country }));
  }, [sp]);

  const set = (p: Partial<Draft>) => setD((cur) => ({ ...cur, ...p }));
  const service = getService(d.service);
  const countries = useMemo(() => [...new Map(MISSIONS.map((m) => [m.countryCode, m.country])).entries()].sort((a, b) => tr(a[1], locale).localeCompare(tr(b[1], locale), locale)), [locale]);
  const missions = MISSIONS.filter((m) => m.countryCode === d.country);

  function saveDraft() {
    try { localStorage.setItem(KEY, JSON.stringify(d)); setSavedAt(Date.now()); } catch {}
  }
  useEffect(() => { if (d.service || d.mission) saveDraft(); }, [d]); // eslint-disable-line react-hooks/exhaustive-deps

  async function addFile(i: number, f?: File) {
    if (!f) return;
    if (f.size > MAX) return setErr({ [`f${i}`]: t.wizard.tooLarge });
    const kind = await sniff(f);
    if (!kind) return setErr({ [`f${i}`]: t.wizard.badType });
    setErr({});
    setFiles((cur) => { if (cur[i]) URL.revokeObjectURL(cur[i].url); return { ...cur, [i]: { file: f, url: URL.createObjectURL(f), kind } }; });
  }

  function validate(step: number) {
    const e: Record<string, string> = {};
    if (step === 0) { if (!d.mission) e.mission = t.wizard.required; if (!d.service) e.service = t.wizard.required; }
    if (step === 1) service?.documents.forEach((doc, i) => { if (doc.required && !files[i]) e[`f${i}`] = t.wizard.required; });
    if (step === 2) {
      if (d.fullName.trim().length < 3) e.fullName = t.wizard.required;
      if (!/^\d{11}$/.test(d.nationalId)) e.nationalId = t.wizard.invalidId;
      if (d.passport && !/^[A-Za-z0-9]{6,9}$/.test(d.passport)) e.passport = t.wizard.invalidPassport;
      if (!d.dob) e.dob = t.wizard.required;
      if (!verified) e.otp = t.wizard.required;
    }
    setErr(e);
    return !Object.keys(e).length;
  }
  const next = () => validate(d.step) && set({ step: d.step + 1 });

  async function sendOtp() {
    setBusy(true);
    const r = await api<{ demoCode?: string }>("/api/otp/send", { method: "POST", json: { channel: d.channel, destination: d.contact.trim() } });
    setBusy(false);
    if (!r.ok) return setErr({ contact: r.data.error ?? "error" });
    setErr({}); setOtpSent(r.data.demoCode ?? "");
  }
  async function verifyOtp() {
    setBusy(true);
    const r = await api("/api/otp/verify", { method: "POST", json: { destination: d.contact.trim(), code: otp } });
    setBusy(false);
    if (!r.ok) return setErr({ otp: r.data.error ?? "error" });
    setErr({}); setVerified(true);
  }

  async function submit() {
    if (!consent) return setErr({ consent: t.wizard.required });
    setBusy(true);
    const fd = new FormData();
    (["service", "mission", "fullName", "nationalId", "passport", "dob"] as const).forEach((k) => fd.append(k, d[k]));
    fd.append("contact", d.contact.trim());
    Object.values(files).forEach((u) => fd.append("files", u.file));
    const r = await api<{ tracking: string; createdAt: string }>("/api/applications", { method: "POST", body: fd });
    setBusy(false);
    if (!r.ok) return setErr({ submit: r.data.error ?? "error" });
    const qr = await QRCode.toDataURL(`${location.origin}/${locale}/verify?code=${r.data.tracking}`, { margin: 1, width: 240, color: { dark: "#0B1B33", light: "#FFFFFF" } });
    try {
      sessionStorage.setItem(`mofa-receipt-${r.data.tracking}`, JSON.stringify({ tracking: r.data.tracking, createdAt: r.data.createdAt, service: d.service, mission: d.mission, fullName: d.fullName, files: Object.values(files).map((u) => u.file.name), qr }));
      localStorage.removeItem(KEY);
    } catch {}
    setDone({ tracking: r.data.tracking, qr, createdAt: r.data.createdAt });
    set({ step: 3 });
  }

  const Err = ({ k }: { k: string }) => err[k] ? <p className="mt-1 text-xs font-medium text-flag-red" role="alert">{err[k]}</p> : null;

  return (
    <div className="container-gov -mt-10 pb-20">
      {hasDraft && d.step === 0 && !d.fullName && (
        <div className="card mb-6 flex flex-wrap items-center justify-between gap-3 border-gold-500/40 bg-gold-100/50 p-4">
          <span className="flex items-center gap-2 text-sm font-medium"><Save className="h-4 w-4 text-gold-700" />{t.wizard.resume}</span>
          <div className="flex gap-2">
            <button className="btn-primary !py-2" onClick={() => { try { setD({ ...EMPTY, ...JSON.parse(localStorage.getItem(KEY)!) }); } catch {} setHasDraft(false); }}>{t.wizard.resume}</button>
            <button className="btn-ghost !py-2" onClick={() => { try { localStorage.removeItem(KEY); } catch {} setHasDraft(false); }}>{t.wizard.discard}</button>
          </div>
        </div>
      )}

      {/* Stepper */}
      <ol className="card relative mb-6 grid grid-cols-4 gap-2 p-4 sm:p-6" aria-label={t.wizard.title}>
        {t.wizard.steps.map((s, i) => (
          <li key={s} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-start" aria-current={i === d.step ? "step" : undefined}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 font-bold transition ${i < d.step ? "border-emerald-500 bg-emerald-500 text-white" : i === d.step ? "border-gold-500 bg-gold-100 text-gold-700" : "border-navy-700/15 text-navy-300"}`}>{i < d.step ? <Check className="h-5 w-5" /> : i + 1}</span>
            <span className={`text-xs font-semibold sm:text-sm ${i === d.step ? "text-navy-700" : "text-navy-300"}`}>{s}</span>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={d.step} initial={{ opacity: 0, x: locale === "ar" ? -24 : 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: locale === "ar" ? 24 : -24 }} transition={{ duration: 0.3 }}>
              {d.step === 0 && (
                <div className="grid gap-5">
                  <div><label className="label" htmlFor="country">{t.wizard.country}</label>
                    <select id="country" className="input" value={d.country} onChange={(e) => set({ country: e.target.value, mission: MISSIONS.find((m) => m.countryCode === e.target.value)?.slug ?? "" })}>
                      <option value="">—</option>{countries.map(([cc, name]) => <option key={cc} value={cc}>{tr(name, locale)}</option>)}
                    </select></div>
                  <div><label className="label" htmlFor="mission">{t.wizard.mission}</label>
                    <select id="mission" className="input" value={d.mission} onChange={(e) => set({ mission: e.target.value })} disabled={!d.country}>
                      <option value="">—</option>{missions.map((m) => <option key={m.slug} value={m.slug}>{t.embassies[m.type]} — {tr(m.city, locale)}</option>)}
                    </select><Err k="mission" /></div>
                  <div><span className="label">{t.wizard.service}</span>
                    <div className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
                      {SERVICES.filter((s) => s.slug !== "certificate-verification").map((s) => (
                        <button type="button" key={s.slug} onClick={() => set({ service: s.slug })} aria-pressed={d.service === s.slug}
                          className={`rounded-xl border p-3 text-start text-sm transition ${d.service === s.slug ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-700" : "border-navy-700/10 hover:border-gold-500"}`}>{tr(s.title, locale)}</button>
                      ))}
                    </div><Err k="service" /></div>
                </div>
              )}

              {d.step === 1 && service && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold">{t.wizard.checklist}</h2>
                  <p className="text-sm text-navy-300">{t.wizard.dropHint}</p>
                  {service.documents.map((doc, i) => {
                    const u = files[i];
                    return (
                      <div key={i} className={`rounded-2xl border-2 border-dashed p-4 transition ${u ? "border-emerald-500/50 bg-emerald-50/40" : err[`f${i}`] ? "border-flag-red/50" : "border-navy-700/15"}`}
                        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFile(i, e.dataTransfer.files[0]); }}>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className={`grid h-10 w-10 place-items-center rounded-full ${u ? "bg-emerald-500 text-white" : "bg-ivory text-navy-300"}`}>{u ? <Check className="h-5 w-5" /> : i + 1}</span>
                          <div className="min-w-0 flex-1"><div className="font-medium">{tr(doc.label, locale)}</div><div className="text-xs text-navy-300">{doc.required ? t.wizard.required : t.wizard.optional}{u && ` · ${u.file.name} · ${(u.file.size / 1024 / 1024).toFixed(2)} MB`}</div></div>
                          {u && <button type="button" onClick={() => setFiles(({ [i]: _, ...rest }) => rest)} className="rounded-lg p-2 text-navy-300 hover:text-flag-red" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>}
                          <label className="btn-ghost cursor-pointer !py-2"><UploadCloud className="h-4 w-4" />{t.wizard.upload}<input type="file" accept="application/pdf,image/jpeg" className="sr-only" onChange={(e) => addFile(i, e.target.files?.[0])} /></label>
                        </div>
                        {u && (
                          <div className="mt-3 overflow-hidden rounded-xl border border-navy-700/10 bg-white">
                            {u.kind === "jpg"
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={u.url} alt="" className="max-h-56 w-full object-contain" />
                              : <object data={u.url} type="application/pdf" className="h-56 w-full"><div className="flex items-center gap-2 p-4 text-sm"><FileText className="h-5 w-5" />{u.file.name}</div></object>}
                          </div>
                        )}
                        <Err k={`f${i}`} />
                      </div>
                    );
                  })}
                </div>
              )}

              {d.step === 2 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2"><label className="label" htmlFor="fn">{t.wizard.fullName}</label><input id="fn" className="input" value={d.fullName} onChange={(e) => set({ fullName: e.target.value })} autoComplete="name" /><Err k="fullName" /></div>
                  <div><label className="label" htmlFor="nid">{t.wizard.nationalId}</label><input id="nid" className="input font-mono" inputMode="numeric" dir="ltr" maxLength={11} value={d.nationalId} onChange={(e) => set({ nationalId: e.target.value.replace(/\D/g, "") })} /><Err k="nationalId" /></div>
                  <div><label className="label" htmlFor="pp">{t.wizard.passport} <span className="normal-case text-navy-300">({t.wizard.optional})</span></label><input id="pp" className="input font-mono uppercase" dir="ltr" maxLength={9} value={d.passport} onChange={(e) => set({ passport: e.target.value.toUpperCase() })} /><Err k="passport" /></div>
                  <div><label className="label" htmlFor="dob">{t.wizard.dob}</label><input id="dob" type="date" className="input" value={d.dob} onChange={(e) => set({ dob: e.target.value })} /><Err k="dob" /></div>
                  <div><span className="label">{t.wizard.channel}</span>
                    <div className="grid grid-cols-2 gap-2">{(["email", "sms"] as const).map((c) => <button key={c} type="button" disabled={verified} onClick={() => { set({ channel: c, contact: "" }); setOtpSent(null); }} className={`rounded-xl border py-3 text-sm font-semibold ${d.channel === c ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-navy-700/10"}`}>{c === "email" ? t.wizard.email : t.wizard.phone.split(" ")[0]}</button>)}</div></div>
                  <div className="sm:col-span-2 rounded-2xl bg-ivory-50 p-5">
                    {verified ? (
                      <div className="flex items-center gap-3 font-semibold text-emerald-600"><ShieldCheck className="h-6 w-6" />{t.wizard.verified} · <span dir="ltr">{d.contact}</span></div>
                    ) : (
                      <>
                        <label className="label" htmlFor="ct">{d.channel === "email" ? t.wizard.email : t.wizard.phone}</label>
                        <div className="flex flex-col gap-2 sm:flex-row"><input id="ct" className="input" dir="ltr" value={d.contact} onChange={(e) => set({ contact: e.target.value })} placeholder={d.channel === "email" ? "name@example.com" : "+49 151 0000000"} type={d.channel === "email" ? "email" : "tel"} />
                          <button type="button" className="btn-dark shrink-0" onClick={sendOtp} disabled={busy || d.contact.length < 5}>{busy && !otpSent ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{t.wizard.sendOtp}</button></div>
                        <Err k="contact" />
                        {otpSent !== null && (
                          <div className="mt-4">
                            {otpSent && <p className="mb-2 rounded-lg bg-gold-100 px-3 py-2 text-xs text-gold-700">{t.wizard.demoCode} <b dir="ltr" className="font-mono">{otpSent}</b></p>}
                            <label className="label" htmlFor="otp">{t.wizard.otp}</label>
                            <div className="flex gap-2"><input id="otp" className="input text-center font-mono text-lg tracking-[.5em]" inputMode="numeric" dir="ltr" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} autoComplete="one-time-code" />
                              <button type="button" className="btn-primary shrink-0" disabled={otp.length !== 6 || busy} onClick={verifyOtp}>{t.wizard.verifyOtp}</button></div>
                          </div>
                        )}
                        <Err k="otp" />
                      </>
                    )}
                  </div>
                </div>
              )}

              {d.step === 3 && !done && (
                <div className="space-y-5">
                  <dl className="grid gap-4 rounded-2xl bg-ivory-50 p-5 text-sm sm:grid-cols-2">
                    {[[t.wizard.service, tr(service?.title, locale)], [t.wizard.mission, tr(MISSIONS.find((m) => m.slug === d.mission)?.city, locale)], [t.wizard.fullName, d.fullName], [t.wizard.nationalId, "•••••••" + d.nationalId.slice(-4)], [t.wizard.checklist, `${Object.keys(files).length} / ${service?.documents.length}`], [t.wizard.channel, d.contact]].map(([k, v]) => <div key={k}><dt className="text-xs text-navy-300">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                  </dl>
                  <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-5 w-5 accent-emerald-500" checked={consent} onChange={(e) => setConsent(e.target.checked)} />{t.wizard.consent}</label>
                  <Err k="consent" /><Err k="submit" />
                  <button className="btn-gold w-full" onClick={submit} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{t.wizard.submit}</button>
                </div>
              )}

              {done && (
                <div className="space-y-6 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white"><Check className="h-8 w-8" /></motion.div>
                  <h2 className="text-2xl font-bold">{t.wizard.submitted}</h2>
                  <div><div className="text-xs text-navy-300">{t.wizard.trackingNo}</div><div className="mt-1 font-mono text-3xl font-bold tracking-wider text-emerald-600" dir="ltr">{done.tracking}</div></div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={done.qr} alt="QR" className="mx-auto h-40 w-40 rounded-xl border border-navy-700/10 p-2" />
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link href={`/${locale}/receipt?n=${done.tracking}`} className="btn-primary">{t.wizard.printReceipt}</Link>
                    <Link href={`/${locale}/track?n=${done.tracking}`} className="btn-ghost">{t.wizard.goTrack}</Link>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {!done && (
            <div className="mt-8 flex items-center justify-between border-t border-navy-700/10 pt-6">
              <button className="btn-ghost" onClick={() => set({ step: Math.max(0, d.step - 1) })} disabled={d.step === 0}>{t.wizard.back}</button>
              {savedAt && <span className="hidden text-xs text-navy-300 sm:inline">{t.wizard.draftSaved}</span>}
              {d.step < 3 && <button className="btn-primary" onClick={next}>{t.wizard.next}</button>}
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          {service ? (
            <div className="card p-5">
              <div className="text-xs text-navy-300">{t.wizard.service}</div>
              <div className="font-bold">{tr(service.title, locale)}</div>
              <div className="gold-rule my-4" />
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-navy-300">{t.service.fee}</dt><dd className="font-semibold">{service.feeUSD ? `USD ${service.feeUSD}` : t.common.free}</dd></div>
                <div className="flex justify-between"><dt className="text-navy-300">{t.service.time}</dt><dd className="font-semibold" dir="ltr">{service.processingDays[1] ? `${service.processingDays[0]}–${service.processingDays[1]}` : "—"}</dd></div>
              </dl>
            </div>
          ) : null}
          <div className="card p-5 text-xs text-navy-300"><ShieldCheck className="mb-2 h-5 w-5 text-emerald-500" />{locale === "ar" ? "تُنقل بياناتك مشفّرة وتُحفظ وثائقك في مخزن مشفّر، ولا يطّلع عليها سوى موظفي البعثة المختصة." : "Your data is transmitted encrypted and your documents are kept in encrypted storage, visible only to officers of the competent mission."}</div>
        </aside>
      </div>
    </div>
  );
}
