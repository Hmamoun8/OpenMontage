import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarCheck, Clock, Mail, MapPin, Phone, Siren, UserRound } from "lucide-react";
import { getMission, MISSIONS } from "@/lib/data/missions";
import { SERVICES } from "@/lib/data/services";
import { ACTIVE_LOCALES, fmtDate, getDict, tr, type Locale } from "@/lib/i18n";
import { PageHero } from "@/components/page-hero";
import { LocalClock } from "@/components/local-clock";

type P = { params: Promise<{ locale: Locale; slug: string }> };
export const generateStaticParams = () => ACTIVE_LOCALES.flatMap((locale) => MISSIONS.map((m) => ({ locale, slug: m.slug })));
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params;
  const m = getMission(slug);
  const t = getDict(locale);
  return m ? { title: `${t.embassies[m.type]} — ${tr(m.city, locale)}` } : {};
}

export default async function MissionPage({ params }: P) {
  const { locale, slug } = await params;
  const m = getMission(slug);
  if (!m) notFound();
  const t = getDict(locale);
  const services = m.services === "all" ? SERVICES : SERVICES.filter((s) => (m.services as string[]).includes(s.slug));
  return (
    <>
      <PageHero eyebrow={`${t.embassies[m.type]} · ${tr(m.country, locale)}`} title={`${t.embassies[m.type]} — ${tr(m.city, locale)}`} lead={tr(m.address, locale)}>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/appointments?mission=${m.slug}`} className="btn-gold"><CalendarCheck className="h-4 w-4" />{t.embassies.book}</Link>
          <a href={`tel:${m.emergency.replace(/[^\d+]/g, "")}`} className="btn bg-flag-red text-white hover:bg-[#a50e1f]"><Siren className="h-4 w-4" />{t.embassies.emergency}</a>
        </div>
      </PageHero>
      <div className="container-gov grid gap-6 py-12 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <h2 className="mb-5 text-xl font-bold">{t.embassies.services}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => <Link key={s.slug} href={`/${locale}/apply?service=${s.slug}&mission=${m.slug}`} className="rounded-xl border border-navy-700/10 px-4 py-3 text-sm font-medium hover:border-gold-500 hover:bg-ivory-50">{tr(s.title, locale)}</Link>)}
          </div>
        </section>
        <aside className="space-y-4">
          <div className="card space-y-4 p-6">
            <div className="flex items-start gap-3"><Clock className="mt-0.5 h-5 w-5 text-emerald-500" /><div><div className="label">{t.embassies.hours}</div><div className="text-sm">{tr(m.hours, locale)}</div><LocalClock tz={m.tz} locale={locale} /></div></div>
            <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 text-emerald-500" /><div><div className="label">{t.embassies.address}</div><div className="text-sm">{tr(m.address, locale)}</div></div></div>
            <div className="flex items-start gap-3"><Phone className="mt-0.5 h-5 w-5 text-emerald-500" /><div><div className="label">{t.embassies.contact}</div><div className="font-mono text-sm" dir="ltr">{m.phone}</div><a href={`mailto:${m.email}`} className="flex items-center gap-1 text-sm text-emerald-600" dir="ltr"><Mail className="h-3.5 w-3.5" />{m.email}</a></div></div>
            <div className="rounded-xl bg-red-50 p-4"><div className="flex items-center gap-2 text-sm font-bold text-flag-red"><Siren className="h-4 w-4" />{t.embassies.emergency}</div><div className="mt-1 font-mono text-lg font-bold text-flag-red" dir="ltr">{m.emergency}</div></div>
            <p className="text-[11px] text-navy-300">{t.embassies.sample}</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-navy-700 text-gold-300"><UserRound className="h-6 w-6" /></span><div><div className="label">{tr(m.head.title, locale)}</div><div className="font-bold">{tr(m.head.name, locale)}</div></div></div>
            <p className="mt-3 text-sm text-navy-300">{tr(m.head.bio, locale)}</p>
          </div>
          <div className="card p-6">
            <h3 className="mb-3 font-bold">{t.embassies.holidays}</h3>
            {m.holidays.length ? <ul className="space-y-2 text-sm">{m.holidays.map((h) => <li key={h.date} className="flex justify-between gap-3"><span>{tr(h.name, locale)}</span><span className="text-navy-300">{fmtDate(h.date, locale, { day: "numeric", month: "short" })}</span></li>)}</ul> : <p className="text-sm text-navy-300">—</p>}
          </div>
        </aside>
      </div>
    </>
  );
}
