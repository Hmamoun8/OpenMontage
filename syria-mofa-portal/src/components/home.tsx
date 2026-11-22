"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarCheck, ChevronDown, QrCode, Search, Siren, Radar } from "lucide-react";
import { useApp } from "./providers";
import { Flag } from "./brand";
import { Icon } from "./icon";
import { Story } from "./story/story";
import { WorldMap } from "./world-map";
import { AssistantChat } from "./assistant";
import { SERVICES } from "@/lib/data/services";
import { MISSIONS } from "@/lib/data/missions";
import { NEWS, NEWS_KIND } from "@/lib/data/content";
import { fmtDate, tr } from "@/lib/i18n";

const Hero3D = dynamic(() => import("./hero3d"), { ssr: false, loading: () => null });

const rise = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] } } as const;

export function Home() {
  const { locale, t, reducedMotion } = useApp();
  const router = useRouter();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const [selected, setSelected] = useState("");
  const [trk, setTrk] = useState("");
  const missionSel = MISSIONS.find((m) => m.slug === selected);

  return (
    <>
      {/* ───────── Cinematic hero ───────── */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-navy-700 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_40%,#16294A_0%,#0B1B33_55%,#050D1A_100%)]" />
        <div className="pattern absolute inset-0 -z-10 opacity-[.08]" />
        <div className="absolute inset-0 -z-10 opacity-30 sm:opacity-60 lg:opacity-100"><Hero3D reduced={reducedMotion} rtl={locale === "ar"} /></div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-navy-900 to-transparent" />
        <div className="container-gov relative pt-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }} className="max-w-3xl">
            <div className="eyebrow mb-6 !text-gold-300"><Flag className="h-4 w-auto rounded-[2px]" />{t.hero.eyebrow}</div>
            <h1 className="h-display text-balance">{t.hero.title}</h1>
            <p className="mt-6 max-w-2xl text-lg text-white/75 sm:text-xl">{t.hero.lead}</p>
            <button onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              className="group mt-8 flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-2 ps-5 text-start backdrop-blur-md transition hover:border-gold-500/60 hover:bg-white/15">
              <Search className="h-5 w-5 text-gold-300" />
              <span className="flex-1 truncate text-white/70">{t.search.placeholder}</span>
              <span className="hidden rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-900 sm:inline">{t.search.kbd}</span>
            </button>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/${locale}/apply`} className="btn-gold">{t.hero.cta1}<Arrow className="h-4 w-4" /></Link>
              <Link href={`/${locale}/track`} className="btn border border-white/20 text-white hover:bg-white/10">{t.hero.cta2}</Link>
            </div>
          </motion.div>
          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="mt-14 grid max-w-3xl grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
            {[[MISSIONS.length + "+", t.home.stats.missions], [SERVICES.length, t.home.stats.services], ["2+2", t.home.stats.languages], ["24/7", t.home.stats.hours]].map(([n, l]) => (
              <div key={String(l)}><dt className="text-xs text-white/55">{l}</dt><dd className="text-3xl font-bold text-gold-300" dir="ltr">{n}</dd></div>
            ))}
          </motion.dl>
        </div>
        <a href="#story" className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-white/60 hover:text-white">
          {t.hero.scroll}<ChevronDown className="h-5 w-5 animate-bounce" />
        </a>
      </section>

      {/* ───────── Quick actions ───────── */}
      <section className="relative z-20 -mt-1 bg-navy-900 pb-16">
        <div className="container-gov grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [CalendarCheck, t.home.quick.book, t.home.quick.bookD, "appointments", "from-emerald-500 to-emerald-700"],
            [Radar, t.home.quick.track, t.home.quick.trackD, "track", "from-navy-300 to-navy-500"],
            [Siren, t.home.quick.emergency, t.home.quick.emergencyD, "services/emergency-consular-support", "from-flag-red to-[#8a0b19]"],
            [QrCode, t.home.quick.verify, t.home.quick.verifyD, "verify", "from-gold-500 to-gold-700"],
          ].map(([I, title, desc, href, grad], k) => {
            const C = I as typeof Siren;
            return (
              <motion.div key={k} {...rise} transition={{ ...rise.transition, delay: k * 0.08 }}>
                <Link href={`/${locale}/${href}`} className="group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[.04] p-6 text-white transition hover:-translate-y-1 hover:border-gold-500/40 hover:bg-white/[.07]">
                  <span className={`mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${grad} shadow-lg`}><C className="h-6 w-6" /></span>
                  <h3 className="text-lg font-bold">{title as string}</h3>
                  <p className="mt-1 text-sm text-white/60">{desc as string}</p>
                  <Arrow className="absolute end-6 top-6 h-5 w-5 text-gold-300 opacity-0 transition group-hover:opacity-100" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ───────── Story of Syria ───────── */}
      <div id="story"><Story /></div>

      {/* ───────── Popular services ───────── */}
      <section className="relative py-24">
        <div className="pattern absolute inset-0 opacity-[.25]" />
        <div className="container-gov relative">
          <motion.div {...rise} className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div><div className="eyebrow">{t.nav.services}</div><h2 className="h-section mt-2">{t.home.popular}</h2><p className="mt-2 text-navy-300">{t.home.popularLead}</p></div>
            <Link href={`/${locale}/services`} className="btn-ghost">{t.common.viewAll}<Arrow className="h-4 w-4" /></Link>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.filter((s) => s.popular).slice(0, 8).map((s, k) => (
              <motion.div key={s.slug} {...rise} transition={{ ...rise.transition, delay: (k % 4) * 0.06 }}>
                <Link href={`/${locale}/services/${s.slug}`} className="card group flex h-full flex-col p-6 transition hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-glow [transform-style:preserve-3d]">
                  <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white"><Icon name={s.icon} className="h-5 w-5" /></span>
                  <h3 className="font-bold">{tr(s.title, locale)}</h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-navy-300">{tr(s.summary, locale)}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="chip bg-ivory text-navy-500" dir="ltr">{s.processingDays[1] ? `${s.processingDays[0]}–${s.processingDays[1]}d` : "24/7"}</span>
                    <span className="font-semibold text-emerald-600">{s.feeUSD ? `$${s.feeUSD}` : t.common.free}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Track + Book ───────── */}
      <section className="container-gov grid gap-6 lg:grid-cols-2">
        <motion.form {...rise} onSubmit={(e) => { e.preventDefault(); router.push(`/${locale}/track?n=${encodeURIComponent(trk)}`); }} className="relative overflow-hidden rounded-3xl bg-emerald-600 p-8 text-white sm:p-10">
          <div className="pattern absolute inset-0 opacity-20" />
          <div className="relative">
            <Radar className="mb-4 h-8 w-8 text-gold-300" />
            <h2 className="text-2xl font-bold">{t.tracker.title}</h2>
            <p className="mt-1 text-white/75">{t.tracker.lead}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <input value={trk} onChange={(e) => setTrk(e.target.value)} placeholder="SY-MOFA-2026-XXXXX" dir="ltr" className="input !border-white/20 !bg-white/10 !text-white placeholder:!text-white/50" aria-label={t.tracker.tracking} />
              <button className="btn-gold shrink-0">{t.tracker.check}</button>
            </div>
          </div>
        </motion.form>
        <motion.div {...rise} className="relative overflow-hidden rounded-3xl bg-navy-700 p-8 text-white sm:p-10">
          <div className="pattern absolute inset-0 opacity-10" />
          <div className="relative">
            <CalendarCheck className="mb-4 h-8 w-8 text-gold-300" />
            <h2 className="text-2xl font-bold">{t.appt.title}</h2>
            <p className="mt-1 text-white/75">{t.appt.lead}</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link href={`/${locale}/appointments`} className="btn-gold">{t.home.quick.book}</Link><Link href={`/${locale}/appointments#manage`} className="btn border border-white/20 hover:bg-white/10">{t.appt.manage}</Link></div>
          </div>
        </motion.div>
      </section>

      {/* ───────── Embassy map ───────── */}
      <section className="py-24">
        <div className="container-gov">
          <motion.div {...rise} className="mb-10 max-w-2xl"><div className="eyebrow">{t.nav.embassies}</div><h2 className="h-section mt-2">{t.home.map}</h2><p className="mt-2 text-navy-300">{t.home.mapLead}</p></motion.div>
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <motion.div {...rise}><WorldMap missions={MISSIONS} selected={selected} onSelect={setSelected} /></motion.div>
            <motion.div {...rise} className="card flex flex-col p-6">
              {missionSel ? (
                <>
                  <div className="chip mb-3 w-fit bg-emerald-50 text-emerald-600">{t.embassies[missionSel.type]}</div>
                  <h3 className="text-2xl font-bold">{tr(missionSel.city, locale)}</h3>
                  <p className="text-navy-300">{tr(missionSel.country, locale)}</p>
                  <div className="gold-rule my-5" />
                  <dl className="space-y-3 text-sm">
                    <div><dt className="label">{t.embassies.hours}</dt><dd>{tr(missionSel.hours, locale)}</dd></div>
                    <div><dt className="label">{t.embassies.emergency}</dt><dd dir="ltr" className="text-start font-mono">{missionSel.emergency}</dd></div>
                  </dl>
                  <div className="mt-auto flex gap-2 pt-6"><Link href={`/${locale}/embassies/${missionSel.slug}`} className="btn-primary flex-1">{t.common.learnMore}</Link><Link href={`/${locale}/appointments?mission=${missionSel.slug}`} className="btn-ghost">{t.appt.reserve.split(" ")[0]}</Link></div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-navy-300">{t.embassies.search}</p>
                  <ul className="max-h-[340px] space-y-1 overflow-y-auto">
                    {MISSIONS.filter((m) => m.type === "embassy").slice(0, 14).map((m) => (
                      <li key={m.slug}><button onClick={() => setSelected(m.slug)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm hover:bg-ivory"><span>{tr(m.country, locale)}</span><span className="text-navy-300">{tr(m.city, locale)}</span></button></li>
                    ))}
                  </ul>
                  <Link href={`/${locale}/embassies`} className="btn-ghost mt-2 w-full">{t.common.viewAll}</Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────── News ───────── */}
      <section className="bg-white py-24">
        <div className="container-gov">
          <motion.div {...rise} className="mb-10 flex items-end justify-between"><div><div className="eyebrow">{t.nav.media}</div><h2 className="h-section mt-2">{t.home.news}</h2></div><Link href={`/${locale}/media`} className="btn-ghost">{t.home.allNews}</Link></motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {NEWS.slice(0, 3).map((n, k) => (
              <motion.article key={n.slug} {...rise} transition={{ ...rise.transition, delay: k * 0.08 }} className={`group relative overflow-hidden rounded-3xl ${k === 0 ? "bg-navy-700 text-white md:row-span-2" : "border border-navy-700/10 bg-ivory-50"}`}>
                <Link href={`/${locale}/media/${n.slug}`} className="flex h-full flex-col p-7">
                  {k === 0 && <div className="pattern absolute inset-0 opacity-10" />}
                  <div className="relative flex items-center gap-2 text-xs"><span className={`chip ${k === 0 ? "bg-gold-500 text-navy-900" : "bg-emerald-50 text-emerald-600"}`}>{tr(NEWS_KIND[n.kind], locale)}</span><time className="opacity-60">{fmtDate(n.date, locale)}</time></div>
                  <h3 className={`relative mt-4 font-bold ${k === 0 ? "text-3xl" : "text-xl"}`}>{tr(n.title, locale)}</h3>
                  <p className={`relative mt-3 ${k === 0 ? "text-white/70" : "text-navy-300"}`}>{tr(n.excerpt, locale)}</p>
                  {k === 0 && <Flag className="relative mt-auto h-10 w-auto self-start rounded pt-8" waving />}
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── AI assistant ───────── */}
      <section className="py-24">
        <div className="container-gov grid items-center gap-10 lg:grid-cols-2">
          <motion.div {...rise}>
            <div className="eyebrow">{t.nav.assistant}</div>
            <h2 className="h-section mt-2">{t.home.assistant}</h2>
            <p className="mt-3 max-w-lg text-lg text-navy-300">{t.home.assistantLead}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {t.assistant.examples.map((e) => <li key={e} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold-500" />{e}</li>)}
            </ul>
          </motion.div>
          <motion.div {...rise} className="card overflow-hidden"><AssistantChat /></motion.div>
        </div>
      </section>
    </>
  );
}
