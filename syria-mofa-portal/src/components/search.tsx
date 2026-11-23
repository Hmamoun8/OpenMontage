"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, CornerDownLeft, FileText, Search, Sparkles } from "lucide-react";
import { normalize, searchKB } from "@/lib/kb";
import { tr } from "@/lib/i18n";
import { useApp } from "./providers";

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, t } = useApp();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) { setQ(""); setTimeout(() => input.current?.focus(), 50); } }, [open]);

  const pages = useMemo(() => Object.entries(t.nav).map(([k, v]) => ({ k, v })), [t]);
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const { services, missions } = searchKB(q);
    const nq = normalize(q);
    return [
      ...pages.filter((p) => normalize(p.v).includes(nq)).slice(0, 3).map((p) => ({ icon: FileText, title: p.v, sub: "", href: `/${locale}/${p.k === "home" ? "" : p.k === "staff" ? "login" : p.k}` })),
      ...services.slice(0, 6).map((s) => ({ icon: FileText, title: tr(s.title, locale), sub: tr(s.summary, locale), href: `/${locale}/services/${s.slug}` })),
      ...missions.slice(0, 4).map((m) => ({ icon: Building2, title: `${tr(m.city, locale)} — ${tr(m.country, locale)}`, sub: t.embassies[m.type], href: `/${locale}/embassies/${m.slug}` })),
      { icon: Sparkles, title: t.search.ask, sub: `“${q}”`, href: `/${locale}/assistant?q=${encodeURIComponent(q)}` },
    ];
  }, [q, locale, pages, t]);

  useEffect(() => setIdx(0), [q]);
  const go = (href: string) => { onClose(); router.push(href); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-start justify-center bg-navy-900/60 p-4 pt-[12vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal aria-label={t.search.placeholder} className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white text-navy-700 shadow-2xl"
            initial={{ y: -20, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: -10, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-navy-700/10 px-5">
              <Search className="h-5 w-5 text-gold-700" />
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search.placeholder} className="h-16 flex-1 bg-transparent text-lg outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Escape") onClose();
                  if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
                  if (e.key === "Enter" && results[idx]) go(results[idx].href);
                }} />
              <kbd className="rounded border border-navy-700/15 px-2 py-0.5 text-xs text-navy-300">Esc</kbd>
            </div>
            <ul className="max-h-[55vh] overflow-y-auto p-2" role="listbox">
              {!q && <li className="px-4 py-6 text-center text-sm text-navy-300">{t.search.hint}</li>}
              {results.map((r, i) => (
                <li key={r.href + i} role="option" aria-selected={i === idx}>
                  <button onMouseEnter={() => setIdx(i)} onClick={() => go(r.href)} className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-start ${i === idx ? "bg-emerald-50" : ""}`}>
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${r.icon === Sparkles ? "bg-gold-100 text-gold-700" : "bg-ivory text-emerald-600"}`}><r.icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{r.title}</span>{r.sub && <span className="block truncate text-xs text-navy-300">{r.sub}</span>}</span>
                    {i === idx && <CornerDownLeft className="h-4 w-4 text-navy-300" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
