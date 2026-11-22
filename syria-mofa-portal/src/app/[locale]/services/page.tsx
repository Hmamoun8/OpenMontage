import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES, SERVICES } from "@/lib/data/services";
import { getDict, tr, type Locale } from "@/lib/i18n";
import { PageHero } from "@/components/page-hero";
import { Icon } from "@/components/icon";

type P = { params: Promise<{ locale: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: getDict((await params).locale).nav.services };
}

export default async function Services({ params }: P) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <>
      <PageHero eyebrow={t.ministry} title={t.nav.services} lead={t.home.popularLead}>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORIES).map(([k, c]) => (
            <a key={k} href={`#${k}`} className="chip border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"><Icon name={c.icon} className="h-4 w-4" />{tr(c.title, locale)}</a>
          ))}
        </div>
      </PageHero>
      <div className="container-gov space-y-16 py-16">
        {Object.entries(CATEGORIES).map(([k, c]) => (
          <section key={k} id={k} className="scroll-mt-32">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-700 text-gold-300"><Icon name={c.icon} className="h-5 w-5" /></span>{tr(c.title, locale)}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {SERVICES.filter((s) => s.category === k).map((s) => (
                <Link key={s.slug} href={`/${locale}/services/${s.slug}`} className="card group flex gap-4 p-5 transition hover:border-gold-500/60 hover:shadow-glow">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"><Icon name={s.icon} className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className="block font-bold">{tr(s.title, locale)}</span>
                    <span className="mt-1 line-clamp-2 block text-sm text-navy-300">{tr(s.summary, locale)}</span>
                    <span className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="chip bg-ivory text-navy-500">{s.feeUSD ? `$${s.feeUSD}` : t.common.free}</span>
                      <span className={`chip ${s.inPerson ? "bg-gold-100 text-gold-700" : "bg-emerald-50 text-emerald-600"}`}>{s.inPerson ? t.service.inPerson : t.service.online}</span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
