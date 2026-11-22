import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "@fontsource-variable/inter";
import "../globals.css";
import { ACTIVE_LOCALES, dir, getDict, isLocale } from "@/lib/i18n";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AssistantWidget } from "@/components/assistant";

export const generateStaticParams = () => ACTIVE_LOCALES.map((locale) => ({ locale }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDict(locale);
  return {
    title: { default: `${t.ministry} — ${t.republic}`, template: `%s · ${t.ministry}` },
    description: t.hero.lead,
    alternates: { languages: Object.fromEntries(ACTIVE_LOCALES.map((l) => [l, `/${l}`])) },
  };
}

export const viewport: Viewport = { themeColor: "#0B1B33", width: "device-width", initialScale: 1 };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} dir={dir(locale)}>
      <body className="min-h-screen">
        <Providers locale={locale}>
          <Suspense><Header /></Suspense>
          <main id="main">{children}</main>
          <Footer />
          <AssistantWidget />
        </Providers>
      </body>
    </html>
  );
}
