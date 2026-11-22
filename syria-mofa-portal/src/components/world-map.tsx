"use client";
import { useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import world from "world-atlas/countries-110m.json";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { Mission } from "@/lib/data/missions";
import { tr } from "@/lib/i18n";
import { useApp } from "./providers";

const W = 960, H = 500;
const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
const countries = feature(topo, topo.objects.countries);
const projection = geoNaturalEarth1().fitSize([W, H], countries);
const path = geoPath(projection);
const DAMASCUS = projection([36.29, 33.51])!;
const SYRIA_ID = "760";

export function WorldMap({ missions, selected, onSelect, dark = false }: { missions: Mission[]; selected?: string; onSelect?: (slug: string) => void; dark?: boolean }) {
  const { locale } = useApp();
  const [zoom, setZoom] = useState(1);
  const [hover, setHover] = useState<string | null>(null);
  const shapes = useMemo(() => countries.features.map((f) => ({ id: String(f.id), d: path(f) ?? "" })), []);
  const sel = missions.find((m) => m.slug === selected);
  const focus = sel ? projection([sel.lng, sel.lat])! : zoom > 1 ? DAMASCUS : [W / 2, H / 2];
  const z = sel ? Math.max(zoom, 2.2) : zoom;
  const tx = W / 2 - focus[0] * z, ty = H / 2 - focus[1] * z;
  const hovered = missions.find((m) => m.slug === hover);

  return (
    <div className={`relative overflow-hidden rounded-3xl ${dark ? "bg-navy-900" : "bg-[#EAF2EE]"}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="World map of Syrian diplomatic missions">
        <defs>
          <radialGradient id="pulse"><stop offset="0" stopColor="#C9A14A" stopOpacity=".7" /><stop offset="1" stopColor="#C9A14A" stopOpacity="0" /></radialGradient>
        </defs>
        <g style={{ transform: `translate(${tx}px, ${ty}px) scale(${z})`, transition: "transform .9s cubic-bezier(.2,.7,.2,1)" }}>
          {shapes.map((s) => (
            <path key={s.id} d={s.d} fill={s.id === SYRIA_ID ? "#007A3D" : dark ? "#16294A" : "#FFFFFF"} stroke={dark ? "#0B1B33" : "#C9D9D1"} strokeWidth={0.5 / z} />
          ))}
          {missions.map((m) => {
            const [x, y] = projection([m.lng, m.lat])!;
            const mx = (DAMASCUS[0] + x) / 2, my = Math.min(DAMASCUS[1], y) - Math.abs(x - DAMASCUS[0]) * 0.18;
            return <path key={`arc-${m.slug}`} d={`M${DAMASCUS[0]} ${DAMASCUS[1]} Q${mx} ${my} ${x} ${y}`} fill="none" stroke="#C9A14A" strokeOpacity={m.slug === selected ? 0.9 : 0.25} strokeWidth={(m.slug === selected ? 1.4 : 0.6) / z} strokeDasharray={`${3 / z} ${3 / z}`} />;
          })}
          {missions.map((m) => {
            const [x, y] = projection([m.lng, m.lat])!;
            const on = m.slug === selected || m.slug === hover;
            return (
              <g key={m.slug} transform={`translate(${x} ${y})`} className="cursor-pointer" onClick={() => onSelect?.(m.slug)} onMouseEnter={() => setHover(m.slug)} onMouseLeave={() => setHover(null)}
                role="button" tabIndex={0} aria-label={`${tr(m.city, locale)}, ${tr(m.country, locale)}`} onKeyDown={(e) => e.key === "Enter" && onSelect?.(m.slug)}>
                <circle r={14 / z} fill="url(#pulse)" className={on ? "" : "opacity-0"} />
                <circle r={(on ? 5 : 3.2) / z} fill={m.type === "embassy" ? "#0A6B47" : m.type === "consulate" ? "#C9A14A" : "#16294A"} stroke="#fff" strokeWidth={1.2 / z} />
              </g>
            );
          })}
          <g transform={`translate(${DAMASCUS[0]} ${DAMASCUS[1]})`}><circle r={6 / z} fill="#CE1126" stroke="#fff" strokeWidth={1.5 / z} /></g>
        </g>
      </svg>
      {hovered && (
        <div className="pointer-events-none absolute start-4 top-4 rounded-xl bg-white/95 px-4 py-2 text-sm shadow-gov">
          <div className="font-bold text-navy-700">{tr(hovered.city, locale)}</div><div className="text-xs text-navy-300">{tr(hovered.country, locale)}</div>
        </div>
      )}
      <div className="absolute bottom-4 end-4 flex flex-col gap-1">
        {[[Plus, () => setZoom((v) => Math.min(v * 1.6, 8)), "Zoom in"], [Minus, () => setZoom((v) => Math.max(v / 1.6, 1)), "Zoom out"], [RotateCcw, () => { setZoom(1); onSelect?.(""); }, "Reset"]].map(([I, fn, label], k) => {
          const C = I as typeof Plus;
          return <button key={k} onClick={fn as () => void} aria-label={label as string} className="grid h-9 w-9 place-items-center rounded-lg bg-white text-navy-700 shadow-gov hover:bg-ivory"><C className="h-4 w-4" /></button>;
        })}
      </div>
    </div>
  );
}
