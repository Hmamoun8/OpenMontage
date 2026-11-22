/**
 * Procedural, layered illustrations for each chapter of the Story of Syria.
 * Each scene returns three depth layers (sky / middle / foreground) that the
 * cinematic scroll engine moves at different speeds and Z-depths.
 * Licensed archival photographs can replace or sit beneath these (see CHAPTERS[].image).
 */
import type { SceneKind } from "@/lib/data/content";

const W = 1600, H = 900;
type Layers = { sky: React.ReactNode; mid: React.ReactNode; front: React.ReactNode };

const rand = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function Dome({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  return <g fill={fill}><path d={`M${x - r} ${y} a${r} ${r * 1.1} 0 0 1 ${2 * r} 0z`} /><rect x={x - r * 1.05} y={y} width={r * 2.1} height={r * 0.9} /><rect x={x - 2} y={y - r * 1.35} width={4} height={r * 0.3} /><circle cx={x} cy={y - r * 1.4} r={4} /></g>;
}
function Minaret({ x, base, h, fill }: { x: number; base: number; h: number; fill: string }) {
  return <g fill={fill}><rect x={x - 9} y={base - h} width={18} height={h} /><rect x={x - 14} y={base - h * 0.72} width={28} height={8} /><rect x={x - 13} y={base - h - 6} width={26} height={8} /><path d={`M${x - 9} ${base - h - 6} L${x} ${base - h - 40} L${x + 9} ${base - h - 6}z`} /></g>;
}
function Column({ x, base, h, fill }: { x: number; base: number; h: number; fill: string }) {
  return <g fill={fill}><rect x={x - 11} y={base - h} width={22} height={h} /><rect x={x - 17} y={base - h - 10} width={34} height={12} /><rect x={x - 16} y={base - 8} width={32} height={8} /></g>;
}
function Arch({ x, base, w, h, fill }: { x: number; base: number; w: number; h: number; fill: string }) {
  // horseshoe arch opening
  return <path fill={fill} d={`M${x - w / 2} ${base} V${base - h + w / 2} a${w / 2} ${w / 2 * 1.15} 0 1 1 ${w} 0 V${base}z`} />;
}
function Person({ x, base, s = 1, fill, arm = 0 }: { x: number; base: number; s?: number; fill: string; arm?: number }) {
  return (
    <g fill={fill} transform={`translate(${x} ${base}) scale(${s})`}>
      <circle cx={0} cy={-62} r={9} />
      <path d="M-12 -50 h24 l4 50 h-32z" />
      {arm > 0 ? <path d={`M8 -48 l${10} -${30 * arm} l5 2 l-9 ${32 * arm}z`} /> : <path d="M10 -48 l6 26 l-5 1 l-6 -24z" />}
      <path d="M-10 -48 l-6 26 l5 1 l6 -24z" />
    </g>
  );
}
function Crowd({ y, n, seed, fill, flags = 0 }: { y: number; n: number; seed: number; fill: string; flags?: number }) {
  const r = rand(seed);
  return <g>{Array.from({ length: n }, (_, i) => {
    const x = (i / n) * W + r() * 30; const s = 1.1 + r() * 0.7; const arm = r() > 0.55 ? 1 : 0;
    return <g key={i}><Person x={x} base={y + r() * 20} s={s} fill={fill} arm={arm} />{flags && r() < flags ? <MiniFlag x={x + 20 * s} y={y - 110 * s} s={s} /> : null}</g>;
  })}</g>;
}
function MiniFlag({ x, y, s }: { x: number; y: number; s: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-2} y={0} width={3} height={60} fill="#222" /><rect x={1} y={0} width={42} height={9} fill="#007A3D" /><rect x={1} y={9} width={42} height={9} fill="#fff" /><rect x={1} y={18} width={42} height={9} fill="#000" />{[12, 22, 32].map((c) => <circle key={c} cx={c} cy={13.5} r={2.2} fill="#CE1126" />)}</g>;
}
function Skyline({ base, seed, fill, broken = false }: { base: number; seed: number; fill: string; broken?: boolean }) {
  const r = rand(seed); const parts: React.ReactNode[] = []; let x = -20;
  while (x < W + 40) {
    const w = 60 + r() * 110, h = 90 + r() * 220;
    if (broken) {
      const jag = Array.from({ length: 6 }, (_, k) => `L${x + (w / 6) * (k + 1)} ${base - h + r() * 70}`).join(" ");
      parts.push(<path key={x} d={`M${x} ${base} V${base - h} ${jag} V${base}z`} fill={fill} />);
      for (let k = 0; k < 3; k++) parts.push(<rect key={`${x}-${k}`} x={x + 10 + r() * (w - 30)} y={base - h + 40 + r() * (h - 60)} width={14} height={18} fill="#0d1117" opacity={.55} />);
    } else parts.push(<rect key={x} x={x} y={base - h} width={w} height={h} fill={fill} />);
    x += w + r() * 8;
  }
  return <g>{parts}</g>;
}
function Crane({ x, base, h, fill }: { x: number; base: number; h: number; fill: string }) {
  return <g stroke={fill} strokeWidth={5} fill="none"><path d={`M${x} ${base} V${base - h} M${x - 60} ${base - h} H${x + 260} M${x} ${base - h} L${x + 60} ${base - h - 40} L${x + 260} ${base - h}`} /><path d={`M${x + 200} ${base - h} V${base - h + 160}`} strokeWidth={2} /><rect x={x + 186} y={base - h + 160} width={28} height={22} fill={fill} /><path d={`M${x - 8} ${base} V${base - h} M${x + 8} ${base} V${base - h}`} strokeWidth={2} strokeDasharray="12 12" /></g>;
}
const Ground = ({ y, fill }: { y: number; fill: string }) => <rect x={-50} y={y} width={W + 100} height={H - y + 50} fill={fill} />;
const Sky = ({ id, stops }: { id: string; stops: [number, string][] }) => (
  <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}</linearGradient></defs><rect width={W} height={H} fill={`url(#${id})`} /></>
);

export function scene(kind: SceneKind): Layers {
  switch (kind) {
    case "heritage":
      return {
        sky: <><Sky id="s-h" stops={[[0, "#F6D9A0"], [0.55, "#E7A65E"], [1, "#B0643A"]]} /><circle cx={1150} cy={430} r={120} fill="#FFF1CF" opacity={.9} />
          {/* Palmyra colonnade, distant */}
          <g opacity={.45}>{Array.from({ length: 12 }, (_, i) => <Column key={i} x={180 + i * 70} base={640} h={150 + (i % 3) * 8} fill="#9A5B33" />)}<Arch x={600} base={640} w={90} h={210} fill="#E7A65E" /></g></>,
        mid: <g>
          <Ground y={700} fill="#7A4526" />
          <Dome x={820} y={600} r={95} fill="#6B3A20" /><rect x={600} y={600} width={460} height={100} fill="#6B3A20" />
          <Minaret x={590} base={700} h={290} fill="#6B3A20" /><Minaret x={1070} base={700} h={250} fill="#6B3A20" />
          {/* Aleppo citadel mound */}
          <path d="M1180 700 L1260 560 H1500 L1580 700z" fill="#5E321B" /><rect x={1290} y={480} width={180} height={80} fill="#5E321B" /><rect x={1350} y={450} width={60} height={30} fill="#5E321B" />
          <Dome x={300} y={640} r={50} fill="#6B3A20" /><rect x={120} y={640} width={320} height={60} fill="#6B3A20" />
        </g>,
        front: <g fill="#3B1F10">
          <Ground y={820} fill="#3B1F10" />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 220 - 40} y={600} width={40} height={230} />)}
          <path d={`M-40 600 H${W + 40} V640 H-40z`} />
          {Array.from({ length: 7 }, (_, i) => <g key={i}><line x1={i * 220 + 70} y1={640} x2={i * 220 + 70} y2={690} stroke="#3B1F10" strokeWidth={2} /><path d={`M${i * 220 + 58} 690 h24 l-4 28 h-16z`} fill="#F2B45B" /><circle cx={i * 220 + 70} cy={704} r={22} fill="#F2B45B" opacity={.18} /></g>)}
        </g>,
      };
    case "revolution":
      return {
        sky: <><Sky id="s-r" stops={[[0, "#FCEFD6"], [0.6, "#CFE6D8"], [1, "#7FB79A"]]} />
          {Array.from({ length: 7 }, (_, i) => <path key={i} transform={`translate(${300 + i * 160} ${180 + (i % 3) * 50}) scale(${0.8 + (i % 2) * 0.3})`} d="M0 0 q20 -18 40 0 q-10 -4 -20 6 q-10 -10 -20 -6z" fill="#fff" opacity={.9} />)}</>,
        mid: <g><Skyline base={720} seed={11} fill="#5E8C74" /><Minaret x={800} base={720} h={330} fill="#4E7A63" /><Ground y={720} fill="#2F5845" /></g>,
        front: <g><Ground y={830} fill="#123A2A" /><Crowd y={850} n={34} seed={7} fill="#123A2A" flags={0.18} /></g>,
      };
    case "conflict":
      return {
        sky: <><Sky id="s-c" stops={[[0, "#B7BDC4"], [0.6, "#7D8590"], [1, "#4A5160"]]} />{Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={200 + i * 330} cy={260 + (i % 2) * 60} rx={260} ry={60} fill="#fff" opacity={.08} />)}</>,
        mid: <g><Skyline base={740} seed={23} fill="#3A4150" broken /><Ground y={740} fill="#2A2F3A" /></g>,
        front: <g>
          <Ground y={820} fill="#1A1F27" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${80 + i * 180} 830 l70 -80 l70 80z`} fill={i % 2 ? "#D9D2C3" : "#BFB6A3"} opacity={.9} />)}
          <Person x={1300} base={830} s={1.3} fill="#0F1318" /><Person x={1340} base={830} s={0.8} fill="#0F1318" />
          <path d="M260 830 v-80 m0 30 l-30 -30 m30 50 l26 -24" stroke="#5FB08A" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>,
      };
    case "liberation":
      return {
        sky: <><Sky id="s-l" stops={[[0, "#06281A"], [0.55, "#0A6B47"], [1, "#F4D9A0"]]} />
          {Array.from({ length: 6 }, (_, i) => { const cx = 200 + i * 250, cy = 160 + (i % 3) * 70; return <g key={i} stroke={["#C9A14A", "#fff", "#CE1126"][i % 3]} strokeWidth={3} opacity={.85}>{Array.from({ length: 12 }, (_, k) => { const a = (k / 12) * Math.PI * 2; return <line key={k} x1={cx + Math.cos(a) * 14} y1={cy + Math.sin(a) * 14} x2={cx + Math.cos(a) * 55} y2={cy + Math.sin(a) * 55} />; })}</g>; })}</>,
        mid: <g>
          <Skyline base={760} seed={5} fill="#0B3B28" /><Ground y={760} fill="#072A1C" />
          {/* Grand waving flag */}
          <g transform="translate(560 250)"><rect x={-6} y={0} width={10} height={520} fill="#111" />
            <path d="M4 10 q120 -40 240 0 t240 0 v90 q-120 -40 -240 0 t-240 0z" fill="#007A3D" />
            <path d="M4 100 q120 -40 240 0 t240 0 v90 q-120 -40 -240 0 t-240 0z" fill="#fff" />
            <path d="M4 190 q120 -40 240 0 t240 0 v90 q-120 -40 -240 0 t-240 0z" fill="#000" />
            {[130, 250, 370].map((x, i) => <polygon key={x} transform={`translate(${x} ${146 + (i === 1 ? 2 : -10)})`} points="0,-22 6,-7 22,-7 9,3 14,19 0,9 -14,19 -9,3 -22,-7 -6,-7" fill="#CE1126" />)}
          </g>
        </g>,
        front: <g><Ground y={840} fill="#03140D" /><Crowd y={860} n={42} seed={3} fill="#03140D" flags={0.35} /></g>,
      };
    case "diplomacy":
      return {
        sky: <><Sky id="s-d" stops={[[0, "#0B1B33"], [1, "#16294A"]]} />
          <g fill="none" stroke="#C9A14A" strokeOpacity={.5}>{Array.from({ length: 9 }, (_, i) => <path key={i} d={`M800 520 Q${200 + i * 150} ${80 + (i % 3) * 40} ${100 + i * 175} ${300 + (i % 4) * 60}`} strokeDasharray="4 8" />)}</g>
          {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={100 + i * 175} cy={300 + (i % 4) * 60} r={5} fill="#DEC07D" />)}<circle cx={800} cy={520} r={9} fill="#5FB08A" /></>,
        mid: <g>{Array.from({ length: 9 }, (_, i) => <Column key={i} x={120 + i * 170} base={820} h={400} fill="#1E3358" />)}<rect x={-20} y={400} width={W + 40} height={22} fill="#1E3358" /><path d={`M-20 400 L${W / 2} 300 L${W + 20} 400z`} fill="#1E3358" /></g>,
        front: <g>
          <Ground y={820} fill="#08132A" />
          <rect x={360} y={740} width={880} height={26} rx={6} fill="#C9A14A" /><rect x={380} y={766} width={840} height={60} fill="#0E1E3B" />
          {[0, 1, 2, 3, 4, 5].map((i) => <Person key={i} x={450 + i * 140} base={760} s={1.1} fill="#050D1A" />)}
          <MiniFlag x={760} y={640} s={1.4} />
        </g>,
      };
    case "rebuild":
      return {
        sky: <><Sky id="s-b" stops={[[0, "#FBF3DF"], [1, "#E6CF98"]]} /><circle cx={300} cy={260} r={90} fill="#fff" opacity={.7} /></>,
        mid: <g>
          <Crane x={300} base={760} h={480} fill="#0A6B47" /><Crane x={1050} base={760} h={420} fill="#085A3C" />
          <g fill="#C7B07A"><rect x={540} y={420} width={260} height={340} /><rect x={900} y={500} width={200} height={260} /></g>
          <g stroke="#9A7A32" strokeWidth={3}>{Array.from({ length: 6 }, (_, i) => <line key={i} x1={540} x2={800} y1={440 + i * 55} y2={440 + i * 55} />)}{Array.from({ length: 5 }, (_, i) => <line key={i} y1={420} y2={760} x1={540 + i * 65} x2={540 + i * 65} />)}</g>
          <Dome x={1300} y={640} r={80} fill="#0A6B47" /><rect x={1180} y={640} width={240} height={120} fill="#C7B07A" />
          <Ground y={760} fill="#B89A5E" />
        </g>,
        front: <g><Ground y={840} fill="#0B1B33" />
          {/* school */}<path d="M120 840 V700 L260 620 L400 700 V840z" fill="#16294A" />{[160, 230, 300].map((x) => <rect key={x} x={x} y={730} width={40} height={50} fill="#DEC07D" />)}
          <Person x={520} base={850} s={0.7} fill="#0B1B33" /><Person x={560} base={850} s={0.6} fill="#0B1B33" /><Person x={1450} base={850} s={1.2} fill="#0B1B33" arm={1} />
        </g>,
      };
    case "future":
      return {
        sky: <><Sky id="s-f" stops={[[0, "#050D1A"], [0.7, "#0B3B4A"], [1, "#0A6B47"]]} />
          {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 97) % W} cy={(i * 53) % 420} r={i % 5 === 0 ? 2 : 1} fill="#fff" opacity={.6} />)}</>,
        mid: <g>
          {[[200, 380, 120], [380, 520, 90], [520, 300, 140], [740, 600, 100], [900, 420, 130], [1100, 520, 110], [1280, 360, 150]].map(([x, h, w], i) => (
            <g key={i}><path d={`M${x} 780 V${780 - h} l${w / 2} -40 l${w / 2} 40 V780z`} fill="#0E2A3A" stroke="#5FB08A" strokeOpacity={.5} />
              {Array.from({ length: Math.floor(h / 40) }, (_, k) => <rect key={k} x={x + 12} y={780 - h + 20 + k * 40} width={w - 24} height={4} fill="#C9A14A" opacity={.35 + (k % 3) * .2} />)}</g>
          ))}
          <Ground y={780} fill="#062019" />
        </g>,
        front: <g><Ground y={850} fill="#020A08" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${60 + i * 160} 850 l40 -40 h70 l-40 40z`} fill="#16294A" stroke="#5FB08A" strokeOpacity={.6} />)}
          <path d="M0 800 C 400 700, 1200 900, 1600 760" stroke="#C9A14A" strokeWidth={2} fill="none" strokeDasharray="2 10" />
        </g>,
      };
  }
}

export function SceneSVG({ kind, layer }: { kind: SceneKind; layer: keyof Layers }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {scene(kind)[layer]}
    </svg>
  );
}
