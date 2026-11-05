/* A single, consistent line-icon set: 24px grid, 1.75 stroke, round caps. */
import type { CSSProperties } from 'react';

const P: Record<string, string> = {
  home: 'M3.5 10.5 12 3.5l8.5 7M6 9v10.5h4.5v-5.5h3v5.5H18V9',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5 5-2z',
  scan: 'M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M7 12h10',
  bookmark: 'M6.5 3.5h11v17L12 16.5l-5.5 4v-17z',
  bookmarkFill: 'M6.5 3.5h11v17L12 16.5l-5.5 4v-17z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5',
  search: 'M11 18.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM20.5 20.5 16.3 16.3',
  mic: 'M12 14.5a3 3 0 0 0 3-3v-5a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zM18.5 11.5a6.5 6.5 0 0 1-13 0M12 18v3',
  camera: 'M4 8.5a2 2 0 0 1 2-2h1.8l1.4-2h5.6l1.4 2H18a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5zM12 16a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z',
  box: 'M20 7.5 12 3.5l-8 4v9l8 4 8-4v-9zM4 7.5l8 4 8-4M12 11.5v9',
  balance: 'M12 4v16M7 20h10M5 8h14M5 8l-2.5 6a3 3 0 0 0 5 0L5 8zM19 8l-2.5 6a3 3 0 0 0 5 0L19 8zM12 4.5l-2 1.5h4l-2-1.5z',
  columns: 'M4 5.5h6.5v13H4zM13.5 5.5H20v13h-6.5zM6.5 9h1.5M16 9h1.5M6.5 12h1.5M16 12h1.5',
  bubble: 'M5 18.5V6.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H8.5L5 18.5zM9 9.5h6M9 12.5h3.5',
  pulse: 'M3 12h4l2-5 3.5 10 2.5-6.5 1.5 1.5H21',
  bowl: 'M3.5 11.5h17a8.5 8.5 0 0 1-17 0zM8 8c0-1.5 1-2 1-3.5M12 8c0-1.5 1-2 1-3.5M16 8c0-1.5 1-2 1-3.5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alert: 'M12 4 2.8 19.5h18.4L12 4zM12 10v4.5M12 17.3v.2',
  x: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  chevronRight: 'M9.5 5.5 16 12l-6.5 6.5',
  chevronDown: 'M5.5 9.5 12 16l6.5-6.5',
  chevronLeft: 'M14.5 5.5 8 12l6.5 6.5',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.8v.2',
  phone: 'M5 4.5h3.5l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 6.1 1.5 1.5 0 0 1 5 4.5z',
  flame: 'M12 21c3.6 0 6-2.5 6-6 0-4-3-6-4-9-2 1.5-2.5 3.5-2.5 5-1-.5-2-2-2-3.5C7 9.5 6 12 6 15c0 3.5 2.4 6 6 6z',
  drop: 'M12 3.5s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z',
  leaf: 'M5 19c0-8.5 5-14 15-14 0 10-5.5 15-14 15M5 19c3-4 6-6.5 9.5-8',
  sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',
  moon: 'M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z',
  share: 'M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12v6.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V12',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
  book: 'M4 5.5A2 2 0 0 1 6 3.5h13v14H6a2 2 0 0 0-2 2v-14zM4 19.5a2 2 0 0 0 2 2h13v-4',
  shield: 'M12 3.5 4.5 6.5V12c0 4.5 3.2 7.6 7.5 9 4.3-1.4 7.5-4.5 7.5-9V6.5L12 3.5z',
  rupee: 'M7 4.5h10M7 9h10M7 4.5h3a4.5 4.5 0 0 1 0 9H7.5l7 7',
  flask: 'M9.5 3.5h5M10 3.5v6L4.8 18a1.8 1.8 0 0 0 1.6 2.5h11.2a1.8 1.8 0 0 0 1.6-2.5L14 9.5v-6M7.5 14.5h9',
  list: 'M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.5M4.5 12h.5M4.5 17.5h.5',
  plus: 'M12 5v14M5 12h14',
  refresh: 'M19.5 8A8 8 0 0 0 4.6 9.5M4.5 4v5.5H10M4.5 16a8 8 0 0 0 14.9-1.5M19.5 20v-5.5H14',
  message: 'M4 19.5l1.4-4.2A8 8 0 1 1 8.7 18.6L4 19.5z',
  sliders: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 4.5v5M9 14.5v5',
  ladder: 'M7 3.5v17M17 3.5v17M7 7h10M7 11.5h10M7 16h10',
  egg: 'M12 21c3.6 0 6-2.6 6-6.5S15.3 3.5 12 3.5 6 10.6 6 14.5 8.4 21 12 21z',
  heart: 'M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.2 4.5 4.5 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z',
  zap: 'M13 3 5 13.5h6L10.5 21 19 10.5h-6L13 3z',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z',
  grid: 'M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z',
  filter: 'M4 5h16l-6 7.5V19l-4 1.5v-8L4 5z',
  pin: 'M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  flash: 'M13 2.5 6 13h5l-1 8.5L17 11h-5l1-8.5z',
  image: 'M4 5.5h16v13H4zM4 15.5l4.5-4.5 4 4 2.5-2.5L20 17.5M15.5 9.5h.01',
  arrowRight: 'M4.5 12h15M13.5 6l6 6-6 6',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 12h17M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z',
  ruler: 'M3.5 16.5 16.5 3.5l4 4-13 13-4-4zM7 13l2 2M10 10l2 2M13 7l2 2',
  baby: 'M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM6 20.5c0-3.5 2.7-6.5 6-6.5s6 3 6 6.5M10.5 7.5h.01M13.5 7.5h.01',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2 2M15.5 15.5l2 2M6.5 17.5l2-2M15.5 8.5l2-2',
  key: 'M8 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM11.5 12h9M17.5 12v3M20.5 12v2',
  lock: 'M6 11h12v9.5H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  trash: 'M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5l1 14h9l1-14',
  close: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  wheat: 'M12 21V9M12 13c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4zM12 13c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4zM12 9c-2 0-3.2-1.2-3.2-3.2C10.8 5.8 12 7 12 9zM12 9c2 0 3.2-1.2 3.2-3.2C13.2 5.8 12 7 12 9zM12 5.5V3',
};

export type IconName = keyof typeof P;

export function Icon({
  name, size = 22, stroke = 1.75, className, style, fill,
}: { name: IconName; size?: number; stroke?: number; className?: string; style?: CSSProperties; fill?: boolean }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className} style={style}
      fill={fill || name === 'bookmarkFill' ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
    >
      <path d={P[name]} />
    </svg>
  );
}

/* ---- portion & unit glyphs used by NumberTranslator / MealPlan -------------- */
export function Teaspoon({ fill = 1, size = 34 }: { fill?: number; size?: number }) {
  const id = `ts-${Math.round(fill * 100)}`;
  const spoon = 'M10 2.5a1.6 1.6 0 0 1 1.6 1.6v12.2c3.6.9 6 4.3 6 8.6 0 5-3.4 9.1-7.6 9.1s-7.6-4.1-7.6-9.1c0-4.3 2.4-7.7 6-8.6V4.1A1.6 1.6 0 0 1 10 2.5z';
  return (
    <svg width={size * 0.6} height={size} viewBox="0 0 20 36" aria-hidden="true">
      <defs><clipPath id={id}><rect x="0" y={36 - 36 * fill} width="20" height="36" /></clipPath></defs>
      <path d={spoon} fill="none" stroke="currentColor" strokeWidth="1.3" opacity=".4" />
      <g clipPath={`url(#${id})`}>
        <path d={spoon} fill="currentColor" />
        <ellipse cx="7.6" cy="23" rx="1.6" ry="3" fill="#fff" opacity=".45" />
      </g>
    </svg>
  );
}

export function Egg({ fill = 1, size = 30 }: { fill?: number; size?: number }) {
  const id = `egg-${Math.round(fill * 100)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs><clipPath id={id}><rect x="0" y={32 - 32 * fill} width="32" height="32" /></clipPath></defs>
      <path d="M16 29c5 0 8.5-3.6 8.5-9S20.4 3.5 16 3.5 7.5 14.6 7.5 20 11 29 16 29z" fill="none" stroke="currentColor" strokeWidth="1.6" opacity=".45" />
      <g clipPath={`url(#${id})`}>
        <path d="M16 29c5 0 8.5-3.6 8.5-9S20.4 3.5 16 3.5 7.5 14.6 7.5 20 11 29 16 29z" fill="currentColor" />
        <ellipse cx="12.5" cy="12" rx="2" ry="3.4" fill="#fff" opacity=".5" />
      </g>
    </svg>
  );
}

export type Portion = 'katori' | 'palm' | 'fist' | 'cupped' | 'tsp' | 'glass' | 'piece';

export function PortionIcon({ kind, size = 28 }: { kind: Portion; size?: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      {kind === 'katori' && (<g {...common}><path d="M4 13h24a12 12 0 0 1-24 0z" /><path d="M12 25h8" /><path d="M7 13c2-2.5 5.5-3.5 9-3.5s7 1 9 3.5" opacity=".6" /></g>)}
      {kind === 'palm' && (<g {...common}><path d="M9 28V15l-2-5a1.6 1.6 0 0 1 3-1l2 4V6a1.6 1.6 0 0 1 3.2 0v7V4.5a1.6 1.6 0 0 1 3.2 0V13V6a1.6 1.6 0 0 1 3.2 0v8.5V9a1.6 1.6 0 0 1 3.2 0V19c0 5-3.5 9-8.5 9H9z" /></g>)}
      {kind === 'fist' && (<g {...common}><path d="M8 13.5a3 3 0 0 1 3-3h10.5a3 3 0 0 1 3 3V21a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6v-7.5z" /><path d="M12.5 10.5v5M16.5 10.5v5M20.5 10.5v5M8 17h5" /></g>)}
      {kind === 'cupped' && (<g {...common}><path d="M4 14c3 7 7.5 10 12 10s9-3 12-10" /><path d="M4 14c4 2 8 3 12 3s8-1 12-3" /><circle cx="12" cy="12.5" r="1.4" /><circle cx="16.5" cy="11.5" r="1.4" /><circle cx="20.5" cy="12.8" r="1.4" /></g>)}
      {kind === 'tsp' && (<g {...common}><ellipse cx="10" cy="16" rx="7" ry="5" /><path d="M17 16h11" /></g>)}
      {kind === 'glass' && (<g {...common}><path d="M8 5h16l-2 22H10L8 5z" /><path d="M9 12h14" opacity=".6" /></g>)}
      {kind === 'piece' && (<g {...common}><circle cx="16" cy="16" r="10" /><path d="M11 13c1.5-2 3-2.5 5-2.5" opacity=".6" /></g>)}
    </svg>
  );
}
