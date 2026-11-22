import { Suspense } from "react";
import type { Metadata } from "next";
import { getDict, type Locale } from "@/lib/i18n";
import { PageHero } from "@/components/page-hero";
import { Wizard } from "@/components/wizard";

type P = { params: Promise<{ locale: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: getDict((await params).locale).wizard.title };
}

export default async function Apply({ params }: P) {
  const t = getDict((await params).locale);
  return (
    <>
      <PageHero eyebrow={t.nav.services} title={t.wizard.title} lead={t.wizard.steps.join(" · ")} />
      <Suspense><Wizard /></Suspense>
    </>
  );
}
