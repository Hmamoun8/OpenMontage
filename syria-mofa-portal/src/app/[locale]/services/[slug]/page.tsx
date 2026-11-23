import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarCheck, CheckCircle2, Circle, Clock, FileCheck2, Landmark, UserCheck, Wallet } from "lucide-react";
import { CATEGORIES, getService, SERVICES } from "@/lib/data/services";
import { ACTIVE_LOCALES, getDict, tr, type Locale } from "@/lib/i18n";
import { PageHero } from "@/components/page-hero";

type P = { params: Promise<{ locale: Locale; slug: string }> };
export const generateStaticParams = () => ACTIVE_LOCALES.flatMap((locale) => SERVICES.map((s) => ({ locale, slug: s.slug })));
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params;
  const s = getService(slug);
  return s ? { title: tr(s.title, locale), description: tr(s.summary, locale) } : {};
}

export default async function ServicePage({ params }: P) {
  const { locale, slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const t = getDict(locale);
  const [a, b] = s.processingDays;
  const facts = [
    [Wallet, t.service.fee, s.feeUSD ? `USD ${s.feeUSD}${s.urgentFeeUSD ? ` · ${locale === "ar" ? "مستعجل" : "urgent"} USD ${s.urgentFeeUSD}` : ""}` : t.common.free],
    [Clock, t.service.time, b ? `${a}–${b} ${t.common.days}` : locale === "ar" ? "فوري / حسب الحالة" : "Immediate / case by case"],
    [Landmark, locale === "ar" ? "طريقة الإنجاز" : "Delivery", s.inPerson ? t.service.inPerson : t.service.online],
  ] as const;
  return (
    <>
      <PageHero eyebrow={tr(CATEGORIES[s.category].title, locale)} title={tr(s.title, locale)} lead={tr(s.summary, locale)}>
        <div className="flex flex-wrap gap-3">
          {slug === "certificate-verification"
            ? <Link href={`/${locale}/verify`} className="btn-gold">{t.nav.verify}</Link>
            : <Link href={`/${locale}/apply?service=${s.slug}`} className="btn-gold">{t.service.apply}</Link>}
          <Link href={`/${locale}/appointments?service=${s.slug}`} className="btn border border-white/20 text-white hover:bg-white/10"><CalendarCheck className="h-4 w-4" />{t.service.book}</Link>
        </div>
      </PageHero>
      <div className="container-gov grid gap-8 py-14 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="card p-7">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold"><FileCheck2 className="h-5 w-5 text-emerald-500" />{t.service.docs}</h2>
            <ul className="space-y-3">
              {s.documents.map((d, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl bg-ivory-50 p-4">
                  {d.required ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-navy-300" />}
                  <span className="flex-1">{tr(d.label, locale)}</span>
                  <span className={`chip ${d.required ? "bg-emerald-50 text-emerald-600" : "bg-white text-navy-300"}`}>{d.required ? t.wizard.required : t.wizard.optional}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-7">
            <h2 className="mb-5 text-xl font-bold">{t.service.steps}</h2>
            <ol className="relative space-y-6 border-s-2 border-dashed border-gold-300 ps-8">
              {s.steps.map((st, i) => (
                <li key={i} className="relative"><span className="absolute -start-[49px] grid h-8 w-8 place-items-center rounded-full bg-navy-700 text-sm font-bold text-gold-300">{i + 1}</span>{tr(st, locale)}</li>
              ))}
            </ol>
          </section>
          <section className="card p-7">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><UserCheck className="h-5 w-5 text-emerald-500" />{t.service.eligibility}</h2>
            <p className="text-navy-500">{tr(s.eligibility, locale)}</p>
          </section>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <div className="card divide-y divide-navy-700/10">
            {facts.map(([I, label, value]) => (
              <div key={label} className="flex items-center gap-4 p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-100 text-gold-700"><I className="h-5 w-5" /></span><div><div className="text-xs text-navy-300">{label}</div><div className="font-semibold">{value}</div></div></div>
            ))}
          </div>
          <p className="px-2 text-xs text-navy-300">{t.service.feeNote}</p>
          <Link href={`/${locale}/assistant?q=${encodeURIComponent(tr(s.title, locale))}`} className="btn-ghost w-full">{t.search.ask}</Link>
        </aside>
      </div>
    </>
  );
}
