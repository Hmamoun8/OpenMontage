"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Printer } from "lucide-react";
import { Flag, Mark } from "@/components/brand";
import { useApp } from "@/components/providers";
import { getService } from "@/lib/data/services";
import { getMission } from "@/lib/data/missions";
import { fmtDate, getDict } from "@/lib/i18n";

type R = { tracking: string; createdAt: string; service: string; mission: string; fullName: string; files: string[]; qr: string };

/** Bilingual printable receipt — "Print → Save as PDF" produces the PDF receipt. */
function Receipt() {
  const { t } = useApp();
  const n = useSearchParams().get("n") ?? "";
  const [r, setR] = useState<R | null>(null);
  useEffect(() => { try { const s = sessionStorage.getItem(`mofa-receipt-${n}`); if (s) setR(JSON.parse(s)); } catch {} }, [n]);
  if (!r) return <div className="container-gov py-40 text-center text-navy-300">{t.tracker.notFound}</div>;
  const s = getService(r.service)!, m = getMission(r.mission)!;
  const ar = getDict("ar"), en = getDict("en");
  const row = (a: string, e: string, v: React.ReactNode) => (
    <tr className="border-b border-navy-700/10"><td className="py-3 pe-4 text-sm text-navy-300" lang="en" dir="ltr">{e}</td><td className="py-3 text-center font-semibold">{v}</td><td className="py-3 ps-4 text-end text-sm text-navy-300" lang="ar" dir="rtl">{a}</td></tr>
  );
  return (
    <div className="container-gov py-32 print:py-0">
      <div className="no-print mb-6 flex justify-center"><button className="btn-primary" onClick={() => window.print()}><Printer className="h-4 w-4" />{t.wizard.printReceipt}</button></div>
      <article className="print-sheet relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-navy-700/10 bg-white p-10 shadow-gov" dir="ltr">
        <div className="pattern absolute inset-0 opacity-[.06]" />
        <div className="relative flex items-center justify-between border-b-2 border-gold-500 pb-6">
          <div className="flex items-center gap-3"><Mark className="h-12 w-12" /><div><div className="font-bold">{en.ministry}</div><div className="text-xs text-navy-300">{en.republic}</div></div></div>
          <Flag className="h-8 w-auto" />
          <div className="text-end" dir="rtl"><div className="font-bold">{ar.ministry}</div><div className="text-xs text-navy-300">{ar.republic}</div></div>
        </div>
        <h1 className="relative mt-6 text-center text-xl font-bold">Application Receipt · <span dir="rtl">إيصال تقديم طلب</span></h1>
        <div className="relative mt-6 grid items-center gap-6 sm:grid-cols-[1fr_auto]">
          <table className="w-full"><tbody>
            {row(ar.wizard.trackingNo, en.wizard.trackingNo, <span className="font-mono text-lg text-emerald-600">{r.tracking}</span>)}
            {row(ar.wizard.fullName, en.wizard.fullName, r.fullName)}
            {row(ar.wizard.service, en.wizard.service, <><div>{s.title.en}</div><div dir="rtl">{s.title.ar}</div></>)}
            {row(ar.wizard.mission, en.wizard.mission, <><div>{m.city.en}, {m.country.en}</div><div dir="rtl">{m.city.ar}، {m.country.ar}</div></>)}
            {row("تاريخ التقديم", "Submitted", <><div>{fmtDate(r.createdAt, "en", { dateStyle: "long", timeStyle: "short" })}</div><div dir="rtl">{fmtDate(r.createdAt, "ar", { dateStyle: "long", timeStyle: "short" })}</div></>)}
            {row("الوثائق المرفقة", "Documents attached", r.files.length)}
            {row("الحالة", "Status", <span className="chip bg-emerald-50 text-emerald-600">Submitted · مُقدَّم</span>)}
          </tbody></table>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="text-center"><img src={r.qr} alt="Verification QR code" className="mx-auto h-40 w-40" /><div className="mt-1 text-[10px] text-navy-300">Scan to verify · امسح للتحقق</div></div>
        </div>
        <p className="relative mt-8 border-t border-navy-700/10 pt-4 text-center text-xs text-navy-300">This receipt is electronically generated and does not require a signature. · <span dir="rtl">هذا الإيصال صادر إلكترونياً ولا يحتاج إلى توقيع.</span></p>
      </article>
    </div>
  );
}

export default function Page() {
  return <Suspense><Receipt /></Suspense>;
}
