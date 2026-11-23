"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Images, Search } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { useApp } from "@/components/providers";
import { NEWS, NEWS_KIND, type NewsKind } from "@/lib/data/content";
import { normalize } from "@/lib/kb";
import { fmtDate, tr } from "@/lib/i18n";
import { Flag } from "@/components/brand";

export default function Media() {
  const { locale, t } = useApp();
  const [kind, setKind] = useState<NewsKind | "">("");
  const [q, setQ] = useState("");
  const [year, setYear] = useState("");
  const years = [...new Set(NEWS.map((n) => n.date.slice(0, 4)))];
  const list = useMemo(() => NEWS.filter((n) => (!kind || n.kind === kind) && (!year || n.date.startsWith(year)) && (!q || normalize(tr(n.title, locale) + tr(n.excerpt, locale)).includes(normalize(q)))), [kind, q, year, locale]);
  const ar = locale === "ar";

  return (
    <>
      <PageHero eyebrow={t.ministry} title={t.nav.media} lead={ar ? "البيانات الرسمية، والبيانات الصحفية، واللقاءات الدولية، والاتفاقيات، والمواد الإعلامية." : "Official statements, press releases, international meetings, treaties and media materials."} />
      <div className="container-gov grid gap-8 py-12 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-navy-700/10 bg-white px-3"><Search className="h-4 w-4 text-navy-300" /><input value={q} onChange={(e) => setQ(e.target.value)} className="h-11 flex-1 bg-transparent text-sm outline-none" placeholder={t.search.placeholder} aria-label="Search news" /></div>
            <select className="input !w-auto" value={kind} onChange={(e) => setKind(e.target.value as NewsKind)} aria-label="Type"><option value="">{t.embassies.all}</option>{(Object.keys(NEWS_KIND) as NewsKind[]).map((k) => <option key={k} value={k}>{tr(NEWS_KIND[k], locale)}</option>)}</select>
            <select className="input !w-auto" value={year} onChange={(e) => setYear(e.target.value)} aria-label="Year"><option value="">{ar ? "كل السنوات" : "All years"}</option>{years.map((y) => <option key={y}>{y}</option>)}</select>
          </div>
          <div className="space-y-4">
            {list.map((n, i) => (
              <motion.article key={n.slug} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/${locale}/media/${n.slug}`} className="card flex gap-5 p-5 transition hover:border-gold-500/60">
                  <div className="hidden w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-navy-700 py-3 text-white sm:flex"><div className="text-2xl font-bold">{new Date(n.date).getDate()}</div><div className="text-xs text-gold-300">{fmtDate(n.date, locale, { month: "short", year: "numeric" })}</div></div>
                  <div><span className="chip bg-emerald-50 text-emerald-600">{tr(NEWS_KIND[n.kind], locale)}</span><h2 className="mt-2 text-lg font-bold">{tr(n.title, locale)}</h2><p className="mt-1 text-sm text-navy-300">{tr(n.excerpt, locale)}</p></div>
                </Link>
              </motion.article>
            ))}
          </div>
          <p className="mt-6 text-xs text-navy-300">{t.common.demo}</p>
        </div>
        <aside className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-navy-700 p-6 text-white">
            <div className="pattern absolute inset-0 opacity-15" />
            <Download className="relative mb-3 h-6 w-6 text-gold-300" />
            <h3 className="relative font-bold">{ar ? "الحقيبة الصحفية" : "Press kit"}</h3>
            <p className="relative mt-1 text-sm text-white/70">{ar ? "الشعار، والعلم، وصور رسمية، ونبذة عن الوزارة." : "Logo, flag, official photographs and ministry fact sheet."}</p>
            <a href="/press-kit.txt" download className="btn-gold relative mt-4 w-full">{ar ? "تحميل" : "Download"}</a>
          </div>
          <div className="card p-6">
            <Images className="mb-3 h-6 w-6 text-emerald-500" />
            <h3 className="font-bold">{ar ? "الصور والفيديو الرسمية" : "Official photos & videos"}</h3>
            <div className="mt-4 grid grid-cols-3 gap-2">{Array.from({ length: 6 }, (_, i) => <div key={i} className="pattern grid aspect-square place-items-center rounded-lg bg-ivory-200"><Flag className="h-4 w-auto opacity-60" /></div>)}</div>
          </div>
        </aside>
      </div>
    </>
  );
}
