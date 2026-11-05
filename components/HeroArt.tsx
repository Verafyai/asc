/** Hero backdrop: evidence flows into a ring of model operators; one signed record goes down to Solana. */
export default function HeroArt() {
  const nodes = Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2 - Math.PI / 2; return { x: 980 + Math.cos(a) * 180, y: 290 + Math.sin(a) * 180 }; });
  return (
    <svg viewBox="0 0 1400 640" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="hg" x1="0" x2="1"><stop offset="0" style={{ stopColor: "var(--sol-purple)" }} /><stop offset="1" style={{ stopColor: "var(--sol-green)" }} /></linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="var(--border-soft)" strokeWidth="1" /></pattern>
      </defs>
      <rect width="1400" height="640" fill="url(#grid)" opacity="0.6" />
      {nodes.map((n, i) => <line key={`l${i}`} x1={n.x} y1={n.y} x2={980} y2={290} stroke="url(#hg)" strokeWidth="1.5" className="flow" opacity="0.55" />)}
      <circle cx="980" cy="290" r="48" fill="var(--surface)" stroke="url(#hg)" strokeWidth="2" />
      <text x="980" y="296" textAnchor="middle" fill="var(--text-3)" fontSize="16" fontFamily="var(--font-mono)">≥ 2/3</text>
      {nodes.map((n, i) => <circle key={`n${i}`} cx={n.x} cy={n.y} r="15" fill="var(--surface)" stroke={i % 2 ? "var(--sol-green)" : "var(--sol-purple)"} strokeWidth="2" className="pulse" style={{ animationDelay: `${i * 0.35}s` }} />)}
      <line x1="980" y1="338" x2="980" y2="540" stroke="url(#hg)" strokeWidth="2" className="flow" />
      <rect x="880" y="540" width="200" height="50" rx="8" fill="var(--surface)" stroke="var(--border)" />
      <rect x="880" y="540" width="200" height="3" fill="url(#hg)" />
      <text x="980" y="571" textAnchor="middle" fill="var(--text-3)" fontSize="15" fontFamily="var(--font-mono)">signed record</text>
    </svg>
  );
}
