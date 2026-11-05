/* Hand-built SVG illustrations: the thali that sits under every page, and
   generic (unbranded) product packaging used on verdict cards. */

function Katori({ cx, cy, r, children }: { cx: number; cy: number; r: number; children: React.ReactNode }) {
  return (
    <g>
      <circle cx={cx} cy={cy + 6} r={r + 4} fill="#000" opacity=".28" />
      <circle cx={cx} cy={cy} r={r + 8} fill="url(#steel)" />
      <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={r} fill="#6d737a" />
      {children}
      <circle cx={cx} cy={cy} r={r} fill="url(#bowlShade)" />
    </g>
  );
}

export function Thali({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 1000" className={className} aria-hidden>
      <defs>
        <radialGradient id="plate" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#eef0f2" />
          <stop offset=".55" stopColor="#b5bac0" />
          <stop offset="1" stopColor="#7d838a" />
        </radialGradient>
        <radialGradient id="steel" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#f4f5f6" />
          <stop offset=".6" stopColor="#a9aeb4" />
          <stop offset="1" stopColor="#6c7178" />
        </radialGradient>
        <radialGradient id="bowlShade" cx="50%" cy="40%" r="60%">
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".35" />
        </radialGradient>
        <radialGradient id="dal" cx="45%" cy="40%" r="60%"><stop offset="0" stopColor="#F6C445" /><stop offset="1" stopColor="#D6901A" /></radialGradient>
        <radialGradient id="palak" cx="45%" cy="40%" r="60%"><stop offset="0" stopColor="#5C9A3C" /><stop offset="1" stopColor="#2D5A1F" /></radialGradient>
        <radialGradient id="rajma" cx="45%" cy="40%" r="60%"><stop offset="0" stopColor="#A2452B" /><stop offset="1" stopColor="#5E1F12" /></radialGradient>
        <radialGradient id="raita" cx="45%" cy="40%" r="60%"><stop offset="0" stopColor="#FBF7EC" /><stop offset="1" stopColor="#DCD3BE" /></radialGradient>
        <radialGradient id="roti" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#ECC27D" /><stop offset="1" stopColor="#B9813F" /></radialGradient>
        <radialGradient id="rice" cx="45%" cy="35%" r="65%"><stop offset="0" stopColor="#FFFDF6" /><stop offset="1" stopColor="#E3DAC6" /></radialGradient>
      </defs>

      {/* plate */}
      <circle cx="500" cy="512" r="478" fill="#000" opacity=".35" />
      <circle cx="500" cy="500" r="480" fill="url(#plate)" />
      <circle cx="500" cy="500" r="440" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="3" />
      <circle cx="500" cy="500" r="432" fill="none" stroke="#5d6268" strokeOpacity=".5" strokeWidth="2" />
      <path d="M190 260 A 380 380 0 0 1 520 120" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="10" strokeLinecap="round" />

      {/* katoris around the rim */}
      <Katori cx={300} cy={250} r={112}>
        <circle cx={300} cy={250} r={112} fill="url(#dal)" />
        <path d="M240 240 q30 -30 60 0 t60 0" stroke="#B9700F" strokeWidth="6" fill="none" opacity=".6" />
        {[[270, 220], [320, 280], [340, 230], [285, 290], [250, 265]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill={i % 2 ? '#7a1d0c' : '#2b1a0d'} />)}
        {[[310, 215], [260, 250], [330, 255]].map(([x, y], i) => <path key={i} d={`M${x} ${y} q8 -10 18 -4`} stroke="#3F6212" strokeWidth="5" fill="none" strokeLinecap="round" />)}
      </Katori>
      <Katori cx={560} cy={185} r={96}>
        <circle cx={560} cy={185} r={96} fill="url(#palak)" />
        {[[530, 165], [585, 175], [555, 215], [600, 210], [520, 205]].map(([x, y], i) => <rect key={i} x={x} y={y} width="20" height="18" rx="4" fill="#F7F1E1" transform={`rotate(${i * 23} ${x} ${y})`} />)}
      </Katori>
      <Katori cx={775} cy={330} r={102}>
        <circle cx={775} cy={330} r={102} fill="url(#raita)" />
        {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={775 + Math.cos(i * 1.7) * (20 + (i * 7) % 70)} cy={330 + Math.sin(i * 1.7) * (20 + (i * 7) % 70)} r="4" fill={i % 3 ? '#5C9A3C' : '#C0392B'} />)}
      </Katori>
      <Katori cx={810} cy={600} r={92}>
        <circle cx={810} cy={600} r={92} fill="url(#rajma)" />
        {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={810 + Math.cos(i * 2.1) * (18 + (i * 9) % 60)} cy={600 + Math.sin(i * 2.1) * (18 + (i * 9) % 60)} rx="13" ry="8" fill="#4A140A" stroke="#7A2E1E" strokeWidth="2" transform={`rotate(${i * 31} ${810 + Math.cos(i * 2.1) * (18 + (i * 9) % 60)} ${600 + Math.sin(i * 2.1) * (18 + (i * 9) % 60)})`} />)}
      </Katori>

      {/* rice mound */}
      <ellipse cx="470" cy="560" rx="150" ry="125" fill="#000" opacity=".12" />
      <ellipse cx="465" cy="548" rx="148" ry="122" fill="url(#rice)" />
      {Array.from({ length: 70 }, (_, i) => {
        const a = i * 2.39996, d = 8 + Math.sqrt(i) * 15;
        return <ellipse key={i} cx={465 + Math.cos(a) * d * 1.2} cy={548 + Math.sin(a) * d} rx="9" ry="3.2" fill="#fff" stroke="#d9cfb8" strokeWidth=".8" transform={`rotate(${(i * 47) % 180} ${465 + Math.cos(a) * d * 1.2} ${548 + Math.sin(a) * d})`} />;
      })}
      <circle cx="430" cy="520" r="10" fill="#F2C94C" />

      {/* rotis, overlapping */}
      {[[250, 640, -10], [290, 700, 14]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y + 8} rx="140" ry="128" fill="#000" opacity=".18" />
          <ellipse cx={x} cy={y} rx="140" ry="128" fill="url(#roti)" />
          {Array.from({ length: 16 }, (_, j) => <ellipse key={j} cx={x + Math.cos(j * 2.3) * (25 + (j * 13) % 95)} cy={y + Math.sin(j * 2.3) * (22 + (j * 11) % 85)} rx={6 + (j % 3) * 4} ry={4 + (j % 2) * 3} fill="#7B4A1C" opacity=".55" />)}
        </g>
      ))}

      {/* salad: onion rings, cucumber, lemon, green chilli */}
      <g>
        {[[560, 770], [600, 805]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="34" fill="#E9C6D8" /><circle cx={x} cy={y} r="24" fill="none" stroke="#B5658D" strokeWidth="4" /><circle cx={x} cy={y} r="13" fill="none" stroke="#B5658D" strokeWidth="3" /></g>)}
        {[[660, 740], [680, 790]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="30" fill="#3E7B2A" /><circle cx={x} cy={y} r="25" fill="#D8EBB5" />{[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={x + Math.cos(k) * 11} cy={y + Math.sin(k) * 11} r="2.5" fill="#B5C99A" />)}</g>)}
        <path d="M520 840 a 50 50 0 0 1 90 -10 z" fill="#F7D74A" stroke="#D8A800" strokeWidth="4" />
        <path d="M680 850 q 60 -30 110 -90" stroke="#3F7A1E" strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d="M788 762 l 10 -14" stroke="#6B4F1D" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* pickle + papad */}
      <ellipse cx="660" cy="470" rx="46" ry="34" fill="#B8321A" />
      {[[645, 460], [670, 478], [660, 455]].map(([x, y], i) => <path key={i} d={`M${x} ${y} l14 4 l-6 10 z`} fill="#E57A2E" />)}
      <circle cx="610" cy="890" r="0" />
      <g opacity=".95">
        <circle cx="390" cy="840" r="78" fill="#E9C77B" />
        {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={390 + Math.cos(i * 2.6) * (10 + (i * 17) % 62)} cy={840 + Math.sin(i * 2.6) * (10 + (i * 17) % 62)} r="3" fill="#8A5A1C" opacity=".7" />)}
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- packaging --- */
export type ArtKind = 'jar' | 'packet' | 'carton' | 'tub' | 'bag' | 'box';

export function ProductArt({ kind, c1, c2 }: { kind: ArtKind; c1: string; c2: string }) {
  const id = `${kind}-${c1.slice(1)}`;
  return (
    <svg viewBox="0 0 120 140" aria-hidden>
      <defs>
        <linearGradient id={`b-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={c2} />
          <stop offset=".35" stopColor={c1} />
          <stop offset=".7" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <linearGradient id={`h-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="133" rx="40" ry="5" fill="#000" opacity=".3" />

      {kind === 'jar' && (<g>
        <rect x="32" y="8" width="56" height="18" rx="5" fill={c2} />
        <rect x="32" y="8" width="56" height="5" rx="2.5" fill="#fff" opacity=".25" />
        <rect x="24" y="24" width="72" height="108" rx="20" fill={`url(#b-${id})`} />
        <rect x="24" y="56" width="72" height="50" fill="#F4EEE3" />
        <circle cx="60" cy="72" r="9" fill={c1} />
        <rect x="38" y="86" width="44" height="4" rx="2" fill={c2} opacity=".85" />
        <rect x="44" y="94" width="32" height="3" rx="1.5" fill={c2} opacity=".5" />
        <rect x="32" y="30" width="7" height="96" rx="3.5" fill={`url(#h-${id})`} />
      </g>)}

      {kind === 'packet' && (<g>
        <path d="M18 18 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 v104 l-6 6 l-6 -6 l-6 6 l-6 -6 l-6 6 l-6 -6 l-6 6 l-6 -6 l-6 6 l-6 -6 l-6 6 l-6 -6 l-6 6 l-6 -6 z" fill={`url(#b-${id})`} />
        <rect x="18" y="34" width="84" height="16" fill={c2} opacity=".9" />
        <rect x="28" y="40" width="40" height="4" rx="2" fill="#F4EEE3" />
        {[[44, 82], [76, 82], [60, 104]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="15" fill="#D9A866" stroke="#A86F2E" strokeWidth="2" />{[0, 1, 2, 3].map((k) => <circle key={k} cx={x - 6 + (k % 2) * 12} cy={y - 5 + Math.floor(k / 2) * 10} r="1.6" fill="#8A5A1C" />)}</g>)}
        <rect x="24" y="22" width="6" height="96" rx="3" fill={`url(#h-${id})`} />
      </g>)}

      {kind === 'carton' && (<g>
        <path d="M30 40 L60 14 L90 40 Z" fill={c2} />
        <rect x="56" y="6" width="8" height="12" rx="1" fill="#F4EEE3" />
        <rect x="30" y="40" width="60" height="92" fill={`url(#b-${id})`} />
        <path d="M90 40 L104 32 V124 L90 132 Z" fill={c2} opacity=".85" />
        <circle cx="60" cy="86" r="18" fill="#FB923C" />
        <circle cx="60" cy="86" r="18" fill="none" stroke="#FFF7ED" strokeWidth="2" strokeDasharray="2 4" />
        <path d="M60 68 q8 -10 16 -6 q-6 8 -16 6" fill="#3F7A1E" />
        <rect x="38" y="112" width="44" height="4" rx="2" fill="#F4EEE3" opacity=".9" />
        <rect x="35" y="44" width="6" height="84" rx="3" fill={`url(#h-${id})`} />
      </g>)}

      {kind === 'tub' && (<g>
        <rect x="16" y="40" width="88" height="92" rx="10" fill={`url(#b-${id})`} />
        <ellipse cx="60" cy="40" rx="44" ry="10" fill={c2} />
        <rect x="16" y="26" width="88" height="16" rx="6" fill={c2} />
        <ellipse cx="60" cy="27" rx="44" ry="9" fill="#F4EEE3" opacity=".25" />
        <rect x="16" y="66" width="88" height="40" fill="#14100C" opacity=".85" />
        <path d="M34 86 h22 a8 8 0 0 0 8 -8 v-2 h-30 z" fill="#F4EEE3" />
        <rect x="64" y="80" width="26" height="4" rx="2" fill="#F4EEE3" opacity=".8" />
        <rect x="24" y="44" width="6" height="84" rx="3" fill={`url(#h-${id})`} />
      </g>)}

      {kind === 'bag' && (<g>
        <path d="M24 30 L30 18 L38 30 L46 18 L54 30 L62 18 L70 30 L78 18 L86 30 L92 18 L96 30 V128 Q96 132 92 132 H28 Q24 132 24 128 Z" fill="#C9A06A" />
        <rect x="24" y="30" width="72" height="4" fill="#8A6A3A" opacity=".5" />
        <rect x="34" y="52" width="52" height="56" rx="8" fill={c1} />
        <path d="M60 100 V64 M60 74 q-9 -2 -10 -10 q9 1 10 10 M60 74 q9 -2 10 -10 q-9 1 -10 10 M60 86 q-9 -2 -10 -10 q9 1 10 10 M60 86 q9 -2 10 -10 q-9 1 -10 10" stroke="#F4EEE3" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="30" y="36" width="6" height="90" rx="3" fill={`url(#h-${id})`} />
      </g>)}

      {kind === 'box' && (<g>
        <path d="M22 34 L40 20 H106 L88 34 Z" fill={c1} opacity=".8" />
        <path d="M88 34 L106 20 V118 L88 132 Z" fill={c2} />
        <rect x="22" y="34" width="66" height="98" fill={`url(#b-${id})`} />
        <path d="M55 102 C 35 95, 35 62, 62 52 C 68 76, 66 94, 55 102 Z" fill="#F4EEE3" opacity=".92" />
        <path d="M56 100 C 56 86, 58 72, 62 56" stroke={c2} strokeWidth="2" fill="none" />
        <path d="M80 20 v-8 h14 v10" stroke="#F4EEE3" strokeWidth="1.5" fill="none" />
        <rect x="88" y="6" width="12" height="10" fill="#F4EEE3" />
        <rect x="28" y="38" width="6" height="90" rx="3" fill={`url(#h-${id})`} />
      </g>)}
    </svg>
  );
}

export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="brand-mark">
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".5" />
      <circle cx="11.5" cy="12" r="3.6" fill="#E8A317" />
      <circle cx="20.5" cy="12.5" r="2.8" fill="#7FB069" />
      <circle cx="17" cy="20.5" r="4" fill="currentColor" opacity=".9" />
    </svg>
  );
}
