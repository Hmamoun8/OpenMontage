import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Building, Globe2, Landmark, Plane, ShieldCheck, Sun } from "lucide-react";
import { VISITORS } from "@/lib/data/content";
import { getDict, tr, type Locale } from "@/lib/i18n";
import { PageHero } from "@/components/page-hero";

type P = { params: Promise<{ locale: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> { return { title: getDict((await params).locale).nav.visitors }; }
const ICONS = { entry: Plane, tourist: Sun, business: Briefcase, diplomatic: ShieldCheck, accreditation: Landmark, ngo: Globe2, culture: Building };

export default async function Visitors({ params }: P) {
  const { locale } = await params;
  const t = getDict(locale);
  const ar = locale === "ar";
  return (
    <>
      <PageHero eyebrow={ar ? "Welcome to Syria" : "أهلاً وسهلاً بكم في سوريا"} title={t.nav.visitors} lead={ar ? "متطلبات الدخول والتأشيرات واعتماد البعثات والمنظمات، ومعلومات ثقافية وسياحية." : "Entry and visa requirements, accreditation of missions and organizations, and cultural and tourism information."} />
      <div className="container-gov py-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {VISITORS.map((v) => {
            const I = ICONS[v.id as keyof typeof ICONS];
            return (
              <section key={v.id} id={v.id} className="card group relative overflow-hidden p-7 transition hover:shadow-glow">
                <div className="pattern absolute -end-10 -top-10 h-40 w-40 rounded-full opacity-0 transition group-hover:opacity-30" />
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-navy-700 text-gold-300"><I className="h-6 w-6" /></span>
                <h2 className="text-lg font-bold">{tr(v.t, locale)}</h2>
                <p className="mt-2 text-navy-500">{tr(v.b, locale)}</p>
              </section>
            );
          })}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gold-100 p-8">
          <p className="max-w-2xl font-medium">{ar ? "تختلف المتطلبات حسب الجنسية. تواصل مع أقرب بعثة سورية للحصول على التأشيرة." : "Requirements vary by nationality. Contact the nearest Syrian mission to obtain your visa."}</p>
          <Link href={`/${locale}/embassies`} className="btn-dark">{t.nav.embassies}</Link>
        </div>
      </div>
    </>
  );
}
