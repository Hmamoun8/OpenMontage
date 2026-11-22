"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getDict, type Dict, type Locale } from "@/lib/i18n";

type Prefs = { scale: number; contrast: boolean; motion: boolean; links: boolean };
const DEFAULT: Prefs = { scale: 1, contrast: false, motion: false, links: false };

const Ctx = createContext<{ locale: Locale; t: Dict; prefs: Prefs; setPrefs: (p: Partial<Prefs>) => void; reducedMotion: boolean }>(null!);

export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const [prefs, set] = useState<Prefs>(DEFAULT);
  const [osReduced, setOsReduced] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem("mofa-a11y"); if (s) set({ ...DEFAULT, ...JSON.parse(s) }); } catch {}
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setOsReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setOsReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty("--scale", String(prefs.scale));
    el.classList.toggle("hc", prefs.contrast);
    el.classList.toggle("rm", prefs.motion);
    el.classList.toggle("ul", prefs.links);
  }, [prefs]);

  const setPrefs = useCallback((p: Partial<Prefs>) => set((cur) => {
    const next = { ...cur, ...p };
    try { localStorage.setItem("mofa-a11y", JSON.stringify(next)); } catch {}
    return next;
  }), []);

  return <Ctx.Provider value={{ locale, t: getDict(locale), prefs, setPrefs, reducedMotion: prefs.motion || osReduced }}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
