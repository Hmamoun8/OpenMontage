"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, Camera, Loader2, ShieldX } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { useApp } from "@/components/providers";
import { api } from "@/lib/client";
import { getService } from "@/lib/data/services";
import { getMission } from "@/lib/data/missions";
import { fmtDate, tr } from "@/lib/i18n";

type V = { tracking: string; service: string; mission: string; status: string; holder: string; issued: string; valid: boolean };

function Verify() {
  const { locale, t } = useApp();
  const sp = useSearchParams();
  const [code, setCode] = useState(sp.get("code") ?? "");
  const [r, setR] = useState<V | null | "none">(null);
  const [busy, setBusy] = useState(false);
  const [scan, setScan] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const ar = locale === "ar";

  const check = useCallback(async (c: string) => {
    if (!c) return;
    setBusy(true);
    const res = await api<V>(`/api/verify?code=${encodeURIComponent(c.trim())}`);
    setBusy(false); setR(res.ok ? res.data : "none");
  }, []);
  useEffect(() => { const c = sp.get("code"); if (c) check(c); }, [sp, check]);

  // QR scanning via the native BarcodeDetector where supported.
  useEffect(() => {
    if (!scan) return;
    let stream: MediaStream | undefined; let raf = 0;
    const BD = (window as unknown as { BarcodeDetector?: new (o: object) => { detect(v: HTMLVideoElement): Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!video.current || !BD) return;
        video.current.srcObject = stream; await video.current.play();
        const det = new BD({ formats: ["qr_code"] });
        const loop = async () => {
          const hits = await det.detect(video.current!).catch(() => []);
          const m = hits[0]?.rawValue.match(/SY-MOFA-\d{4}-\d{5}/);
          if (m) { setCode(m[0]); setScan(false); check(m[0]); } else raf = requestAnimationFrame(loop);
        };
        loop();
      } catch { setScan(false); }
    })();
    return () => { cancelAnimationFrame(raf); stream?.getTracks().forEach((x) => x.stop()); };
  }, [scan, check]);

  return (
    <>
      <PageHero eyebrow={t.nav.services} title={t.nav.verify} lead={ar ? "تحقق من صحة أي وثيقة أو إيصال صادر عن البعثات السورية عبر رمز QR أو رقم الوثيقة." : "Verify any document or receipt issued by Syrian missions using its QR code or document number."}>
        <form onSubmit={(e) => { e.preventDefault(); check(code); }} className="glass flex max-w-2xl flex-col gap-3 rounded-2xl p-3 text-navy-700 sm:flex-row">
          <input className="input font-mono" dir="ltr" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SY-MOFA-2026-XXXXX" aria-label="Document number" />
          <button type="button" className="btn-ghost shrink-0" onClick={() => setScan(!scan)}><Camera className="h-4 w-4" />QR</button>
          <button className="btn-gold shrink-0" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{t.tracker.check}</button>
        </form>
      </PageHero>
      <div className="container-gov max-w-3xl py-12">
        {scan && <video ref={video} className="mb-6 aspect-video w-full rounded-2xl bg-black object-cover" muted playsInline />}
        {r === "none" && <div className="card flex items-center gap-4 p-6 text-flag-red"><ShieldX className="h-8 w-8" /><div className="font-bold">{ar ? "لم يتم العثور على وثيقة بهذا الرقم" : "No document found with this number"}</div></div>}
        {r && r !== "none" && (
          <div className={`card overflow-hidden ${r.valid ? "border-emerald-500/40" : "border-gold-500/40"}`}>
            <div className={`flex items-center gap-4 p-6 text-white ${r.valid ? "bg-emerald-500" : "bg-gold-700"}`}>
              <BadgeCheck className="h-10 w-10" />
              <div><div className="text-xl font-bold">{r.valid ? (ar ? "وثيقة صحيحة وصادرة رسمياً" : "Authentic, officially issued") : (ar ? "الطلب مسجل ولم يصدر بعد" : "Registered — not yet issued")}</div><div className="font-mono text-sm opacity-80" dir="ltr">{r.tracking}</div></div>
            </div>
            <dl className="grid gap-4 p-6 text-sm sm:grid-cols-2">
              {[[t.wizard.service, tr(getService(r.service)?.title, locale)], [t.wizard.mission, tr(getMission(r.mission)?.city, locale)], [ar ? "صاحب العلاقة" : "Holder", r.holder], [ar ? "آخر تحديث" : "Last update", r.issued ? fmtDate(r.issued, locale) : "—"], [ar ? "الحالة" : "Status", t.status[r.status as keyof typeof t.status]]].map(([k, v]) => <div key={k}><dt className="text-xs text-navy-300">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
            </dl>
          </div>
        )}
      </div>
    </>
  );
}

export default function Page() {
  return <Suspense><Verify /></Suspense>;
}
