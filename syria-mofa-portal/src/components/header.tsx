"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Accessibility, Menu, Search, X, Globe, LockKeyhole, Siren } from "lucide-react";
import { ACTIVE_LOCALES, LOCALES } from "@/lib/i18n";
import { useApp } from "./providers";
import { Flag, Mark } from "./brand";
import { SearchPalette } from "./search";
import { A11yPanel } from "./a11y-panel";

export function Header() {
  const { locale, t } = useApp();
  const path = usePathname();
  const qs = useSearchParams().toString();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [a11y, setA11y] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); } };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("keydown", onKey); };
  }, []);
  useEffect(() => setOpen(false), [path]);

  const swap = (l: string) => `/${l}${path.replace(/^\/[a-z]{2}/, "")}${qs ? `?${qs}` : ""}`;
  const nav = [
    ["services", t.nav.services], ["embassies", t.nav.embassies], ["appointments", t.nav.appointments],
    ["track", t.nav.track], ["media", t.nav.media], ["ministry", t.nav.ministry],
  ] as const;
  const isHome = path === `/${locale}`;
  const light = isHome && !scrolled && !open;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[100] focus:rounded-lg focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-navy-900">{t.skip}</a>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${light ? "text-white" : "glass text-navy-700 shadow-gov"}`}>
        <div className={`border-b transition-colors ${light ? "border-white/10 bg-navy-900/30" : "border-navy-700/10 bg-navy-700 text-white"}`}>
          <div className="container-gov flex h-9 items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Flag className="h-3.5 w-auto rounded-[2px] shadow" />
              <span className="font-medium opacity-90">{t.republic}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <Link href={`/${locale}/services/emergency-consular-support`} className="hidden items-center gap-1 rounded-md px-2 py-1 text-red-200 hover:bg-white/10 sm:inline-flex"><Siren className="h-3.5 w-3.5" />{t.home.quick.emergency}</Link>
              <button onClick={() => setA11y(true)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/10" aria-label={t.a11y.title}><Accessibility className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t.a11y.title}</span></button>
              <div className="flex items-center gap-0.5 rounded-md bg-white/10 p-0.5" role="group" aria-label="Language">
                <Globe className="mx-1 h-3.5 w-3.5 opacity-70" />
                {(Object.keys(LOCALES) as (keyof typeof LOCALES)[]).map((l) =>
                  ACTIVE_LOCALES.includes(l) ? (
                    <Link key={l} href={swap(l)} hrefLang={l} lang={l} aria-current={l === locale} className={`rounded px-2 py-0.5 font-semibold ${l === locale ? "bg-gold-500 text-navy-900" : "hover:bg-white/10"}`}>{LOCALES[l].short}</Link>
                  ) : (
                    <span key={l} title="Coming soon" className="hidden px-1.5 py-0.5 opacity-40 sm:inline">{LOCALES[l].short}</span>
                  ),
                )}
              </div>
              <Link href={`/${locale}/login`} className="hidden items-center gap-1 rounded-md px-2 py-1 hover:bg-white/10 md:inline-flex"><LockKeyhole className="h-3.5 w-3.5" />{t.nav.staff}</Link>
            </div>
          </div>
        </div>
        <div className="container-gov flex h-16 items-center gap-4">
          <Link href={`/${locale}`} className="flex shrink-0 items-center gap-3" aria-label={t.ministry}>
            <Mark className="h-10 w-10" />
            <div className="leading-tight">
              <div className="text-[15px] font-bold xl:max-w-[210px] 2xl:max-w-none">{t.ministry}</div>
              <div className={`hidden text-[11px] sm:block ${light ? "text-white/70" : "text-navy-300"}`}>{locale === "ar" ? "Ministry of Foreign Affairs and Expatriates" : "وزارة الخارجية والمغتربين"}</div>
            </div>
          </Link>
          <nav className="ms-auto hidden items-center gap-1 xl:flex" aria-label="Main">
            {nav.map(([href, label]) => {
              const active = path.startsWith(`/${locale}/${href}`);
              return (
                <Link key={href} href={`/${locale}/${href}`} className={`relative whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-medium transition 2xl:px-3 2xl:text-sm ${active ? "text-gold-500" : light ? "hover:bg-white/10" : "hover:bg-navy-700/5"}`}>
                  {label}
                  {active && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded bg-gold-500" />}
                </Link>
              );
            })}
          </nav>
          <div className="ms-auto flex items-center gap-2 xl:ms-2">
            <button onClick={() => setSearch(true)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${light ? "border-white/20 bg-white/10 hover:bg-white/20" : "border-navy-700/10 bg-white hover:border-gold-500"}`} aria-label={t.search.placeholder}>
              <Search className="h-4 w-4" /><span className="hidden whitespace-nowrap opacity-70 2xl:inline">{t.search.kbd}</span>
            </button>
            <Link href={`/${locale}/apply`} className="btn-gold hidden !py-2 sm:inline-flex">{t.nav.apply}</Link>
            <button className="rounded-lg p-2 xl:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">{open ? <X /> : <Menu />}</button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-navy-700/10 bg-white text-navy-700 xl:hidden">
              <div className="container-gov grid gap-1 py-4 sm:grid-cols-2">
                {[...nav, ["visitors", t.nav.visitors], ["apply", t.nav.apply], ["assistant", t.nav.assistant], ["verify", t.nav.verify], ["login", t.nav.staff]].map(([href, label]) => (
                  <Link key={href} href={`/${locale}/${href}`} className="rounded-lg px-3 py-3 font-medium hover:bg-ivory">{label}</Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <SearchPalette open={search} onClose={() => setSearch(false)} />
      <A11yPanel open={a11y} onClose={() => setA11y(false)} />
    </>
  );
}
