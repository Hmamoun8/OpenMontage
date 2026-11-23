/** Syrian flag (green–white–black with three red stars), drawn to the 2:3 proportion. */
export function Flag({ className = "h-5 w-auto", waving = false }: { className?: string; waving?: boolean }) {
  const star = (cx: number) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 ? 3.2 : 8;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
    }).join(" ");
    return <polygon key={cx} points={pts} fill="#CE1126" />;
  };
  return (
    <svg viewBox="0 0 150 100" className={className} role="img" aria-label="Syrian flag">
      {waving && (
        <defs>
          <linearGradient id="wave" x1="0" x2="1">
            <stop offset="0" stopColor="#000" stopOpacity=".12" /><stop offset=".3" stopColor="#fff" stopOpacity=".1" />
            <stop offset=".6" stopColor="#000" stopOpacity=".1" /><stop offset="1" stopColor="#fff" stopOpacity=".08" />
          </linearGradient>
        </defs>
      )}
      <rect width="150" height="33.34" fill="#007A3D" />
      <rect y="33.33" width="150" height="33.34" fill="#FFFFFF" />
      <rect y="66.66" width="150" height="33.34" fill="#000000" />
      {[45, 75, 105].map(star)}
      {waving && <rect width="150" height="100" fill="url(#wave)" />}
    </svg>
  );
}

/** Portal mark: an eight-point khatam star framed by a horseshoe arch. (Not the state coat of arms.) */
export function Mark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="mk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#DEC07D" /><stop offset="1" stopColor="#9A7A32" /></linearGradient>
      </defs>
      <path d="M8 60V30a24 24 0 0 1 48 0v30" fill="none" stroke="url(#mk)" strokeWidth="3" />
      <g transform="translate(32 33)">
        <rect x="-11" y="-11" width="22" height="22" fill="#0A6B47" />
        <rect x="-11" y="-11" width="22" height="22" fill="#0A6B47" transform="rotate(45)" />
        <circle r="6.5" fill="none" stroke="url(#mk)" strokeWidth="2" />
        <circle r="2.2" fill="#CE1126" />
      </g>
    </svg>
  );
}
