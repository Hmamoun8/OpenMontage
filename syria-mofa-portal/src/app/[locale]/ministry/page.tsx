import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Handshake, Landmark, ScrollText, UserRound } from "lucide-react";
import { MINISTRY, NEWS } from "@/lib/data/content";
import { getDict, tr, type Locale } from "@/lib/i18n";
import { PageHero } from "@/components/page-hero";

type P = { params: Promise<{ locale: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> { return { title: getDict((await params).locale).nav.ministry }; }

export default async function Ministry({ params }: P) {
  const { locale } = await params;
  const t = getDict(locale);
  const ar = locale === "ar";
  return (
    <>
      <PageHero eyebrow={t.republic} title={t.ministry} lead={ar ? "الوزير، والهيكل التنظيمي، والتاريخ الدبلوماسي، والسياسة الخارجية، والعلاقات الثنائية والدولية." : "The Minister, organizational structure, diplomatic history, foreign policy, and bilateral and international relations."} />
      <div className="container-gov space-y-16 py-14">
        <section className="grid items-center gap-8 lg:grid-cols-[320px_1fr]">
          <div className="arch relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-emerald-600 to-navy-700"><div className="pattern absolute inset-0 opacity-20" /><UserRound className="absolute inset-0 m-auto h-24 w-24 text-gold-300/70" /></div>
          <div><div className="eyebrow">{ar ? "الوزير" : "The Minister"}</div><h2 className="h-section mt-2">{tr(MINISTRY.minister.name, locale)}</h2><p className="mt-4 max-w-2xl text-lg text-navy-500">{tr(MINISTRY.minister.bio, locale)}</p></div>
        </section>

        <section>
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold"><Landmark className="h-6 w-6 text-emerald-500" />{ar ? "الهيكل التنظيمي" : "Organizational structure"}</h2>
          <div className="mx-auto mb-6 w-fit rounded-2xl bg-navy-700 px-8 py-4 font-bold text-white shadow-glow">{ar ? "وزير الخارجية والمغتربين" : "Minister of Foreign Affairs and Expatriates"}</div>
          <div className="grid gap-4 md:grid-cols-4">
            {MINISTRY.structure.map((s) => (
              <div key={s.t.en} className="card p-5"><div className="mb-3 font-bold text-emerald-600">{tr(s.t, locale)}</div><ul className="space-y-1.5 text-sm text-navy-500">{s.c.map((c) => <li key={c.en} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />{tr(c, locale)}</li>)}</ul></div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="card p-7">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold"><ScrollText className="h-5 w-5 text-emerald-500" />{ar ? "التاريخ الدبلوماسي" : "Diplomatic history"}</h2>
            <ol className="space-y-5 border-s-2 border-gold-300 ps-6">{MINISTRY.history.map((h) => <li key={h.y} className="relative"><span className="absolute -start-[33px] top-1 h-4 w-4 rounded-full border-4 border-white bg-emerald-500" /><div className="font-mono font-bold text-gold-700">{h.y}</div><div>{tr(h.t, locale)}</div></li>)}</ol>
          </div>
          <div className="card p-7">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold"><Compass className="h-5 w-5 text-emerald-500" />{ar ? "ثوابت السياسة الخارجية" : "Foreign policy principles"}</h2>
            <ul className="space-y-3">{MINISTRY.policy.map((p, i) => <li key={i} className="flex gap-3 rounded-xl bg-ivory-50 p-4"><span className="font-bold text-gold-700">{String(i + 1).padStart(2, "0")}</span>{tr(p, locale)}</li>)}</ul>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-emerald-600 p-8 text-white sm:p-12">
          <div className="pattern absolute inset-0 opacity-20" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div><Handshake className="mb-3 h-8 w-8 text-gold-300" /><h2 className="text-2xl font-bold">{ar ? "العلاقات الثنائية والدولية والمعاهدات" : "Bilateral & international relations, treaties"}</h2><p className="mt-2 text-white/75">{ar ? "تابع اللقاءات الدولية والاتفاقيات الموقعة في المركز الإعلامي." : "Follow international meetings and signed agreements in the Media Center."}</p></div>
            <Link href={`/${locale}/media`} className="btn-gold">{t.nav.media} ({NEWS.filter((n) => n.kind === "treaty" || n.kind === "meeting").length})</Link>
          </div>
        </section>
      </div>
    </>
  );
}
