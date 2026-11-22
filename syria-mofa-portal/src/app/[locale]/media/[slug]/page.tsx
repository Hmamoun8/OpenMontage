import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NEWS, NEWS_KIND } from "@/lib/data/content";
import { ACTIVE_LOCALES, fmtDate, getDict, tr, type Locale } from "@/lib/i18n";
import { PageHero } from "@/components/page-hero";

type P = { params: Promise<{ locale: Locale; slug: string }> };
export const generateStaticParams = () => ACTIVE_LOCALES.flatMap((locale) => NEWS.map((n) => ({ locale, slug: n.slug })));
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params;
  const n = NEWS.find((x) => x.slug === slug);
  return n ? { title: tr(n.title, locale) } : {};
}

export default async function Article({ params }: P) {
  const { locale, slug } = await params;
  const n = NEWS.find((x) => x.slug === slug);
  if (!n) notFound();
  const t = getDict(locale);
  return (
    <>
      <PageHero eyebrow={`${tr(NEWS_KIND[n.kind], locale)} · ${fmtDate(n.date, locale)}`} title={tr(n.title, locale)} lead={tr(n.excerpt, locale)} />
      <article className="container-gov max-w-3xl py-12">
        <p className="text-lg leading-loose">{tr(n.body, locale)}</p>
        <p className="mt-6 text-xs text-navy-300">{t.common.demo}</p>
        <Link href={`/${locale}/media`} className="btn-ghost mt-10">{t.common.back}</Link>
      </article>
    </>
  );
}
