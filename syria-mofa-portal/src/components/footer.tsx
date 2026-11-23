"use client";
import Link from "next/link";
import { useApp } from "./providers";
import { Flag, Mark } from "./brand";

export function Footer() {
  const { locale, t } = useApp();
  const cols = [
    [t.nav.services, [["services", t.service.all], ["apply", t.nav.apply], ["track", t.nav.track], ["verify", t.nav.verify]]],
    [t.nav.embassies, [["embassies", t.nav.embassies], ["appointments", t.nav.appointments], ["services/emergency-consular-support", t.home.quick.emergency]]],
    [t.nav.ministry, [["ministry", t.nav.ministry], ["media", t.nav.media], ["visitors", t.nav.visitors], ["assistant", t.nav.assistant]]],
  ] as const;
  return (
    <footer className="relative mt-24 overflow-hidden bg-navy-900 text-white">
      <div className="pattern absolute inset-0 opacity-[.07]" />
      <div className="flex h-1.5"><div className="flex-1 bg-flag-green" /><div className="flex-1 bg-white" /><div className="flex-1 bg-black" /></div>
      <div className="container-gov relative grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <div className="flex items-center gap-3"><Mark className="h-12 w-12" /><div><div className="font-bold">{t.ministry}</div><div className="text-sm text-white/60">{t.republic}</div></div></div>
          <p className="max-w-sm text-sm text-white/60">{t.hero.lead}</p>
          <Flag className="h-8 w-auto rounded shadow-lg" />
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <h3 className="mb-4 text-sm font-semibold text-gold-300">{title}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              {links.map(([href, label]) => <li key={href}><Link href={`/${locale}/${href}`} className="hover:text-white">{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-gov flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} {t.ministry} — {t.footer.rights}</span>
          <span className="flex gap-4"><a href="#">{t.footer.privacy}</a><a href="#">{t.footer.terms}</a><a href="#">{t.footer.accessibility}</a></span>
        </div>
      </div>
    </footer>
  );
}
