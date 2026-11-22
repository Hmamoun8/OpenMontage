"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAPTERS } from "@/lib/data/content";
import { tr } from "@/lib/i18n";
import { useApp } from "../providers";
import { SceneSVG } from "./scenes";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

function Plate({ i, children }: { i: number; children?: React.ReactNode }) {
  const c = CHAPTERS[i];
  return (
    <div className="plate absolute inset-0 overflow-hidden will-change-[clip-path]" style={{ zIndex: i + 1 }} data-i={i}>
      <div className="camera absolute inset-0 [transform-style:preserve-3d]">
        <div className="layer-sky absolute inset-[-6%]"><SceneSVG kind={c.id} layer="sky" /></div>
        {c.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.image} alt={tr(c.caption, "en")} className="layer-photo absolute inset-[-6%] h-[112%] w-[112%] object-cover mix-blend-multiply opacity-80" loading="lazy" />
        )}
        <div className="layer-mid absolute inset-[-6%]"><SceneSVG kind={c.id} layer="mid" /></div>
        <div className="layer-front absolute inset-[-4%]"><SceneSVG kind={c.id} layer="front" /></div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent" />
      </div>
      {children}
    </div>
  );
}

function Caption({ i, compact = false }: { i: number; compact?: boolean }) {
  const { locale, t } = useApp();
  const c = CHAPTERS[i];
  return (
    <div className={`caption absolute inset-x-0 bottom-0 z-10 text-white [text-shadow:0_2px_18px_rgba(5,13,26,.6)] ${compact ? "p-6" : "pb-20 sm:pb-24"}`}>
      <div className={compact ? "" : "container-gov"}>
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-gold-300">
            <span className="rounded-full border border-gold-300/40 px-3 py-1">{t.story.chapter} {i + 1}/{CHAPTERS.length}</span>
            <span dir="ltr">{c.years}</span>
          </div>
          <h3 className={`font-bold leading-tight ${compact ? "text-2xl sm:text-3xl" : "text-4xl sm:text-6xl"}`}>{tr(c.title, locale)}</h3>
          <p className={`text-white/85 ${compact ? "mt-2 text-sm" : "mt-4 text-lg sm:text-xl"}`}>{tr(c.body, locale)}</p>
          <p className="mt-4 text-sm text-white/55">{tr(c.caption, locale)}{c.credit ? ` · ${c.credit}` : ""}</p>
        </div>
      </div>
    </div>
  );
}

export function Story() {
  const { locale, t, reducedMotion } = useApp();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useIso(() => {
    if (reducedMotion || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const plates = gsap.utils.toArray<HTMLElement>(".plate");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current, pin: ".stage", start: "top top", end: `+=${CHAPTERS.length * 110}%`, scrub: 0.8,
          onUpdate: (s) => setActive(Math.min(CHAPTERS.length - 1, Math.floor(s.progress * CHAPTERS.length * 0.999))),
        },
      });
      plates.forEach((p, i) => {
        const q = gsap.utils.selector(p);
        const at = i; // one unit per chapter
        if (i > 0) {
          // horseshoe-arch portal reveal
          tl.fromTo(p, { clipPath: "inset(100% 50% 0% 50% round 50% 50% 0 0)" }, { clipPath: "inset(0% 0% 0% 0% round 0% 0% 0 0)", duration: 0.45, ease: "power2.in" }, at - 0.45);
          tl.fromTo(q(".camera"), { scale: 1.35, rotateX: 8, transformPerspective: 1200 }, { scale: 1.08, rotateX: 0, duration: 0.45, ease: "power2.out" }, at - 0.45);
          tl.fromTo(q(".caption"), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.25 }, at - 0.15);
        }
        // cinematic dolly within the chapter
        tl.fromTo(q(".layer-sky"), { yPercent: 0, scale: 1 }, { yPercent: -4, scale: 1.04, duration: 1 }, at - (i ? 0.45 : 0));
        tl.fromTo(q(".layer-mid"), { yPercent: 2, scale: 1.02 }, { yPercent: -3, scale: 1.08, duration: 1 }, at - (i ? 0.45 : 0));
        tl.fromTo(q(".layer-front"), { yPercent: 3, scale: 1.02 }, { yPercent: -5, scale: 1.14, duration: 1 }, at - (i ? 0.45 : 0));
        if (i < plates.length - 1) tl.to(q(".caption"), { autoAlpha: 0, y: -40, duration: 0.2 }, at + 0.55);
      });
    }, root);
    return () => ctx.revert();
  }, [reducedMotion, locale]);

  if (reducedMotion) {
    return (
      <section aria-label={t.story.label} className="bg-navy-900 py-16 text-white">
        <div className="container-gov mb-8"><div className="eyebrow !text-gold-300">{t.story.label}</div><p className="mt-2 text-sm text-white/60">{t.story.reduced}</p></div>
        <ol className="container-gov grid gap-6 md:grid-cols-2">
          {CHAPTERS.map((c, i) => (
            <li key={c.id} className="relative h-[420px] overflow-hidden rounded-3xl">
              <Plate i={i}><Caption i={i} compact /></Plate>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section ref={root} aria-label={t.story.label} className="relative bg-navy-900">
      <div className="stage relative h-screen w-full overflow-hidden [perspective:1200px]">
        {CHAPTERS.map((c, i) => <Plate key={c.id} i={i}><Caption i={i} /></Plate>)}
        {/* Chapter rail */}
        <nav aria-label={t.story.label} className="absolute end-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex">
          {CHAPTERS.map((c, i) => (
            <div key={c.id} className="group flex items-center justify-end gap-3">
              <span className={`text-xs font-semibold text-white transition ${i === active ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`}>{tr(c.title, locale)}</span>
              <span className={`block rounded-full transition-all ${i === active ? "h-8 w-1.5 bg-gold-500" : "h-1.5 w-1.5 bg-white/50"}`} />
            </div>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 z-40 h-1 bg-white/10"><div className="h-full bg-gradient-to-r from-flag-green via-white to-flag-red transition-all duration-300" style={{ width: `${((active + 1) / CHAPTERS.length) * 100}%` }} /></div>
        <div className="absolute start-0 top-24 z-40 px-6 text-white/70"><div className="eyebrow !text-gold-300">{t.story.label}</div></div>
      </div>
    </section>
  );
}
