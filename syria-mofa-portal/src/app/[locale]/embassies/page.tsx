"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Search } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { WorldMap } from "@/components/world-map";
import { useApp } from "@/components/providers";
import { MISSIONS, type MissionType, type Region } from "@/lib/data/missions";
import { normalize } from "@/lib/kb";
import { tr } from "@/lib/i18n";

export default function Embassies() {
  const { locale, t } = useApp();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<Region | "">("");
  const [type, setType] = useState<MissionType | "">("");
  const [sel, setSel] = useState("");

  const list = useMemo(() => {
    const nq = normalize(q);
    return MISSIONS.filter((m) => (!region || m.region === region) && (!type || m.type === type) &&
      (!nq || normalize(`${m.country.ar} ${m.country.en} ${m.city.ar} ${m.city.en}`).includes(nq)))
      .sort((a, b) => tr(a.country, locale).localeCompare(tr(b.country, locale), locale));
  }, [q, region, type, locale]);

  const Pill = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} aria-pressed={on} className={`chip px-4 py-2 text-sm transition ${on ? "bg-navy-700 text-white" : "border border-navy-700/10 bg-white hover:border-gold-500"}`}>{children}</button>
  );

  return (
    <>
      <PageHero eyebrow={t.ministry} title={t.embassies.title} lead={t.embassies.lead}>
        <div className="glass flex max-w-xl items-center gap-3 rounded-2xl px-4 text-navy-700"><Search className="h-5 w-5 text-gold-700" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.embassies.search} className="h-14 flex-1 bg-transparent outline-none" aria-label={t.embassies.search} /></div>
      </PageHero>
      <div className="container-gov space-y-6 py-10">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.embassies.region}>
          <Pill on={!region} onClick={() => setRegion("")}>{t.embassies.all}</Pill>
          {(Object.keys(t.embassies.regions) as Region[]).map((r) => <Pill key={r} on={region === r} onClick={() => setRegion(r)}>{t.embassies.regions[r]}</Pill>)}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.embassies.type}>
          <Pill on={!type} onClick={() => setType("")}>{t.embassies.all}</Pill>
          {(["embassy", "consulate", "mission"] as MissionType[]).map((ty) => <Pill key={ty} on={type === ty} onClick={() => setType(ty)}>{t.embassies[ty]}</Pill>)}
        </div>
        <WorldMap missions={list} selected={sel} onSelect={setSel} />
        <p className="text-xs text-navy-300">{t.embassies.sample}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m, i) => (
            <motion.div key={m.slug} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
              <Link href={`/${locale}/embassies/${m.slug}`} onMouseEnter={() => setSel(m.slug)} className={`card flex items-center gap-4 p-5 transition hover:border-gold-500/60 hover:shadow-glow ${sel === m.slug ? "border-gold-500" : ""}`}>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${m.type === "embassy" ? "bg-emerald-50 text-emerald-600" : m.type === "consulate" ? "bg-gold-100 text-gold-700" : "bg-navy-700 text-gold-300"}`}><Building2 className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block font-bold">{tr(m.country, locale)}</span><span className="block text-sm text-navy-300">{t.embassies[m.type]} · {tr(m.city, locale)}</span></span>
                <span className="text-xs text-navy-300">{m.countryCode}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
