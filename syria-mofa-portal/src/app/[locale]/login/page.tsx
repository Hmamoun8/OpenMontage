"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2, LockKeyhole } from "lucide-react";
import { useApp } from "@/components/providers";
import { Mark } from "@/components/brand";
import { api } from "@/lib/client";

function Login() {
  const { locale, t } = useApp();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [m, setM] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await api<{ role: string }>("/api/auth/login", { method: "POST", json: { username: u, password: p, mfa: m } });
    setBusy(false);
    if (!r.ok) return setErr(r.status === 429 ? "Too many attempts" : locale === "ar" ? "بيانات الدخول غير صحيحة" : "Invalid credentials");
    const dest = next?.startsWith(`/${locale}/dashboard`) ? next : `/${locale}/dashboard/${r.data.role === "admin" ? "admin" : "mission"}`;
    router.push(dest); router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-navy-900 px-4 pt-24">
      <div className="pattern absolute inset-0 opacity-10" />
      <form onSubmit={submit} className="relative w-full max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-2xl">
        <div className="text-center"><Mark className="mx-auto h-14 w-14" /><h1 className="mt-3 text-2xl font-bold">{t.dash.signIn}</h1><p className="text-sm text-navy-300">{t.ministry}</p></div>
        <div><label className="label" htmlFor="u">{t.dash.username}</label><input id="u" className="input" dir="ltr" autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} required /></div>
        <div><label className="label" htmlFor="p">{t.dash.password}</label><input id="p" type="password" className="input" dir="ltr" autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} required /></div>
        <div><label className="label" htmlFor="m"><KeyRound className="me-1 inline h-3.5 w-3.5" />{t.dash.mfa}</label><input id="m" className="input text-center font-mono tracking-[.4em]" inputMode="numeric" maxLength={6} dir="ltr" autoComplete="one-time-code" value={m} onChange={(e) => setM(e.target.value.replace(/\D/g, ""))} required /></div>
        {err && <p className="text-sm text-flag-red" role="alert">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}{t.dash.signIn}</button>
        <div className="rounded-xl bg-gold-100 p-3 text-xs text-gold-700" dir="ltr">
          <b>Demo accounts</b> — password <code>Demo@2026</code>, MFA <code>000000</code><br />officer.berlin · officer.riyadh · admin
        </div>
      </form>
    </div>
  );
}

export default function Page() {
  return <Suspense><Login /></Suspense>;
}
