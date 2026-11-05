import {
  useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode, type HTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Egg, Icon, Teaspoon, type IconName } from './Icon';
import { ProductArt } from './Art';
import type { Alternative, Evidence, LadderStep, Product, ScoreItem, Verdict } from '../data/types';
import { glossary } from '../data/content';

/* ------------------------------------------------------------- GlassCard --- */
type Level = 1 | 2 | 3;
export function GlassCard({
  level = 1, as: Tag = 'div', press, liquid, tint, className = '', children, ...rest
}: {
  level?: Level; as?: ElementType; press?: boolean; liquid?: boolean; tint?: Verdict; className?: string; children?: ReactNode;
} & HTMLAttributes<HTMLElement> & Record<string, unknown>) {
  const cls = ['glass', level === 2 && 'raised', level === 3 && 'floating', press && 'pressable', liquid && 'liquid', tint && `tint-${tint}`, className]
    .filter(Boolean).join(' ');
  return <Tag className={cls} {...rest}>{children}</Tag>;
}

/* ---------------------------------------------------------- VerdictBadge --- */
export const verdictLabel: Record<Verdict, string> = { good: 'Good', moderate: 'Moderate', bad: 'Bad' };
export const verdictIcon: Record<Verdict, IconName> = { good: 'check', moderate: 'alert', bad: 'x' };

/** Verdicts are inspector's stamps: colour + icon + word, never colour alone. */
export function VerdictBadge({ v, size = 'md', label, pulse, delay, tilt }: { v: Verdict; size?: 'sm' | 'md' | 'lg'; label?: string; pulse?: boolean; delay?: number; tilt?: number }) {
  const iconSize = size === 'lg' ? 22 : size === 'sm' ? 11 : 15;
  const style = { ...(delay !== undefined ? { '--delay': `${delay}ms` } : {}), ...(tilt !== undefined ? { '--tilt': `${tilt}deg` } : {}) } as CSSProperties;
  return (
    <span className={`verdict ${v} ${size !== 'md' ? size : ''} ${pulse ? 'pulse' : ''}`} style={style}>
      <span className="vi"><Icon name={verdictIcon[v]} size={iconSize} stroke={3} /></span>
      <span>{label ?? verdictLabel[v]}</span>
    </span>
  );
}

export function SplitVerdict({ items }: { items: { verdict: Verdict; text: string }[] }) {
  return (
    <div className="split-verdict">
      {items.map((s, i) => (
        <div key={i} className="split-row">
          <VerdictBadge v={s.verdict} pulse delay={200 + i * 260} tilt={i % 2 ? 2 : -4} />
          <span className="h3" style={{ fontWeight: 550 }}>{s.text}</span>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- Popover --- */
export function Popover({ trigger, children, label }: { trigger: ReactNode; children: ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<CSSProperties>({ left: 0, top: 0, visibility: 'hidden' });

  useLayoutEffect(() => {
    if (!open || !btn.current || !pop.current) return;
    const r = btn.current.getBoundingClientRect();
    const p = pop.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const left = Math.min(Math.max(12, r.left + r.width / 2 - p.width / 2), vw - p.width - 12);
    const above = r.top - p.height - 10;
    const top = above > 12 ? above : r.bottom + 10;
    setPos({ left, top, position: 'fixed' });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (pop.current?.contains(e.target as Node) || btn.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onScroll = () => setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
      window.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [open]);

  return (
    <>
      <button ref={btn} type="button" aria-expanded={open} aria-label={label} onClick={() => setOpen((o) => !o)} style={{ display: 'inline' }}>
        {trigger}
      </button>
      {open && createPortal(
        <div ref={pop} role="tooltip" className="glass raised pop" style={pos}>{children}</div>,
        document.body,
      )}
    </>
  );
}

/* ---------------------------------------------------------- EvidenceChip --- */
const EV: Record<Evidence, { label: string; color: string; bars: number; text: string }> = {
  strong: { label: 'Strong', color: 'var(--ev-strong)', bars: 3, text: 'Strong evidence: many good-quality human studies agree.' },
  moderate: { label: 'Moderate', color: 'var(--ev-moderate)', bars: 2, text: 'Moderate evidence: decent human studies, but some gaps or mixed results.' },
  weak: { label: 'Weak', color: 'var(--ev-weak)', bars: 1, text: 'Weak evidence: small, short or animal studies. Don’t rely on it.' },
  none: { label: 'No good evidence', color: 'var(--ev-none)', bars: 0, text: 'No good evidence: claims rest on tradition, anecdotes or marketing.' },
};
export function EvidenceChip({ level }: { level: Evidence }) {
  const e = EV[level];
  return (
    <Popover
      label={`Evidence: ${e.label}. Tap for meaning`}
      trigger={
        <span className="evidence" style={{ '--ec': e.color } as CSSProperties}>
          <span className="bars">{[0, 1, 2].map((i) => <i key={i} className={i < e.bars ? 'on' : ''} />)}</span>
          {e.label}
        </span>
      }
    >
      <div className="eyebrow" style={{ marginBottom: 6 }}>Evidence · {e.label}</div>
      {e.text}
    </Popover>
  );
}

/* --------------------------------------------------- Glossary + RichText --- */
export function GlossaryTerm({ term, children }: { term: string; children: ReactNode }) {
  const def = glossary[term.toLowerCase()];
  if (!def) return <>{children}</>;
  return (
    <Popover label={`Define ${term}`} trigger={<span className="gloss">{children}</span>}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{term}</div>
      {def}
    </Popover>
  );
}

/** Renders text with [[term]] glossary links and {{ev:level}} evidence chips. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[\[[^\]]+\]\]|\{\{ev:[a-z]+\}\})/g);
  return (
    <>
      {parts.map((p, i) => {
        const g = /^\[\[(.+)\]\]$/.exec(p);
        if (g) return <GlossaryTerm key={i} term={g[1]}>{g[1]}</GlossaryTerm>;
        const e = /^\{\{ev:([a-z]+)\}\}$/.exec(p);
        if (e) return <span key={i} style={{ whiteSpace: 'nowrap' }}> <EvidenceChip level={e[1] as Evidence} /></span>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/* ----------------------------------------------------------- Collapsible --- */
export function Collapsible({ open, children }: { open: boolean; children: ReactNode }) {
  return <div className={`collapse ${open ? 'is-open' : ''}`} aria-hidden={!open}><div>{children}</div></div>;
}

/* ---------------------------------------------------------- ScorecardRow --- */
const scoreMeta: Record<ScoreItem['key'], { label: string; icon: IconName }> = {
  nutrition: { label: 'Nutrition', icon: 'bowl' },
  ingredients: { label: 'Ingredients', icon: 'list' },
  claims: { label: 'Claims vs evidence', icon: 'flask' },
  safety: { label: 'Safety', icon: 'shield' },
  value: { label: 'Value', icon: 'rupee' },
};
const vColor: Record<Verdict, string> = { good: 'var(--good)', moderate: 'var(--moderate)', bad: 'var(--bad)' };

export function ScorecardRow({ item, index }: { item: ScoreItem; index: number }) {
  const [open, setOpen] = useState(false);
  const m = scoreMeta[item.key];
  return (
    <li className={`score-row ${open ? 'open' : ''}`}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="ico"><Icon name={m.icon} size={19} /></span>
        <span className="lbl">{m.label}</span>
        <span className="leader" style={{ '--i': index } as CSSProperties} aria-hidden />
        <span className="check-mark" style={{ '--vc': vColor[item.verdict], '--i': index } as CSSProperties}>
          <Icon name={verdictIcon[item.verdict]} size={14} stroke={3} />{verdictLabel[item.verdict]}
        </span>
        <Icon name="chevronDown" size={16} className="chev" />
      </button>
      <Collapsible open={open}><p className="detail">{item.detail}</p></Collapsible>
    </li>
  );
}

/* ------------------------------------------------------ NumberTranslator --- */
export function SugarTranslator({ grams }: { grams: number }) {
  const tsp = grams / 4; // 1 level teaspoon of sugar ≈ 4 g
  const whole = Math.floor(tsp);
  const frac = Math.round((tsp - whole) * 2) / 2;
  const spoons = [...Array(whole).fill(1), ...(frac ? [frac] : [])].slice(0, 12);
  const label = frac === 1 ? `${whole + 1}` : `${whole || (frac ? '' : '0')}${frac === 0.5 ? '½' : ''}`;
  return (
    <div>
      <div className="spoons" style={{ color: 'var(--text)' }} aria-hidden>
        {spoons.map((f, i) => <span key={i} style={{ animationDelay: `${i * 70}ms` }}><Teaspoon fill={f} /></span>)}
        {grams === 0 && <span className="faint small">none</span>}
      </div>
      <div className="small muted" style={{ marginTop: 4 }}>≈ {grams < 1 ? 'under ¼' : label} teaspoon{tsp > 1.25 ? 's' : ''}</div>
    </div>
  );
}

export function ProteinTranslator({ grams }: { grams: number }) {
  const eggs = grams / 6; // one large egg ≈ 6 g protein
  const whole = Math.floor(eggs);
  const frac = Math.round((eggs - whole) * 2) / 2;
  const list = [...Array(Math.min(whole, 6)).fill(1), ...(frac && whole < 6 ? [frac] : [])];
  const count = frac === 1 ? `${whole + 1}` : `${whole || ''}${frac === 0.5 ? '½' : ''}`;
  const text = eggs < 0.25 ? 'less than ¼ egg' : `${count} egg${eggs > 1.25 ? 's' : ''}`;
  return (
    <div>
      <div className="spoons" style={{ color: 'var(--text)' }} aria-hidden>
        {list.map((f, i) => <span key={i} style={{ animationDelay: `${i * 70}ms` }}><Egg fill={f} /></span>)}
      </div>
      <div className="small muted" style={{ marginTop: 4 }}>≈ {text}{eggs > 6 ? ' +' : ''}</div>
    </div>
  );
}

export function SaltRing({ grams, limit = 5 }: { grams: number; limit?: number }) {
  const pct = Math.min(1, grams / limit);
  const r = 22, c = 2 * Math.PI * r;
  const color = pct > 0.3 ? 'var(--bad)' : pct > 0.15 ? 'var(--moderate)' : 'var(--good)';
  return (
    <div className="row" style={{ gap: 10 }}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeOpacity=".14" strokeWidth="6" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 28 28)" style={{ transition: 'stroke-dasharray .8s var(--ease)', filter: `drop-shadow(0 0 6px ${color})` }} />
        <text x="28" y="32" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor" className="num">{Math.round(pct * 100)}%</text>
      </svg>
      <div className="small muted">of the {limit} g<br />daily salt limit</div>
    </div>
  );
}

/* --------------------------------------------------------- ProsConsPanel --- */
export function ProsConsPanel({ good, bad, side = true }: { good: string[]; bad: string[]; side?: boolean }) {
  return (
    <GlassCard className={`pad-lg pros-cons ${side ? 'side' : ''}`}>
      <div>
        <div className="row between" style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '3px solid var(--good)' }}>
          <h3 className="h2" style={{ fontSize: 20 }}>The <em style={{ color: 'var(--good)' }}>good</em></h3><span className="eyebrow num">{good.length}</span>
        </div>
        <ul className="bullets">{good.map((g) => <li key={g}><span className="g" style={{ color: 'var(--good)' }} aria-label="Good point">+</span><span>{g}</span></li>)}</ul>
      </div>
      <div>
        <div className="row between" style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '3px solid var(--bad)' }}>
          <h3 className="h2" style={{ fontSize: 20 }}>The <em style={{ color: 'var(--bad)' }}>not-so-good</em></h3><span className="eyebrow num">{bad.length}</span>
        </div>
        <ul className="bullets">{bad.map((g) => <li key={g}><span className="g" style={{ color: 'var(--bad)' }} aria-label="Negative point">−</span><span>{g}</span></li>)}</ul>
      </div>
    </GlassCard>
  );
}

/* ------------------------------------------------------- AlternativeCard --- */
export function AlternativeCard({ alt }: { alt: Alternative }) {
  return (
    <GlassCard className="pad" press style={{ width: 248, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="row between">
        <span className="eyebrow" style={{ color: alt.homemade ? 'var(--accent)' : undefined }}>{alt.homemade ? 'Make it at home' : 'Buy instead'}</span>
        <VerdictBadge v={alt.verdict} size="sm" />
      </div>
      <div className="h3">{alt.name}</div>
      <p className="small muted">{alt.note}</p>
      {alt.price && <div className="small num" style={{ fontWeight: 700, marginTop: 'auto' }}>{alt.price}</div>}
    </GlassCard>
  );
}

/* ------------------------------------------------------- ProductThumb ---- */
export function ProductThumb({ p, height = 112, className = '' }: { p: Product; height?: number; className?: string }) {
  return <div className={`art ${className}`} style={{ height }}><ProductArt kind={p.art} c1={p.palette[0]} c2={p.palette[1]} /></div>;
}

export function ProductMini({ p }: { p: Product }) {
  return (
    <GlassCard as={Link} to={`/product/${p.id}`} press className="mini">
      <ProductThumb p={p} />
      <div className="grow">
        <div className="eyebrow" style={{ fontSize: 10 }}>{p.category}</div>
        <div className="h3" style={{ fontSize: 15, marginTop: 2 }}>{p.name}</div>
      </div>
      <VerdictBadge v={p.split ? 'moderate' : p.verdict} size="sm" label={p.split ? 'Split' : undefined} />
    </GlassCard>
  );
}

/* ------------------------------------------------------------- RangeBar --- */
export function RangeBar({ min, max, zones, value, unit }: {
  min: number; max: number; zones: { upTo: number; label: string; tone: Verdict }[]; value: number; unit: string;
}) {
  const span = max - min;
  let prev = min;
  const pct = Math.max(0, Math.min(100, ((value - min) / span) * 100));
  return (
    <div className="range" role="img" aria-label={`${value} ${unit}`}>
      <div className="marker num" style={{ left: `${pct}%` }}><b>{value} {unit}</b><i /></div>
      <div className="track">
        {zones.map((z) => {
          const w = ((z.upTo - prev) / span) * 100; prev = z.upTo;
          return <div key={z.label} className="seg" style={{ width: `${w}%`, background: vColor[z.tone] }} />;
        })}
      </div>
      <div className="labels" style={{ flexWrap: 'wrap', gap: '6px 16px', marginTop: 12 }}>
        {zones.map((z, i) => {
          const from = i === 0 ? min : zones[i - 1].upTo;
          const range = i === 0 ? `< ${z.upTo}` : z.upTo === max ? `${from}+` : `${from}–${z.upTo}`;
          return (
            <span key={z.label} className="row" style={{ gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: vColor[z.tone] }} />
              <b style={{ color: 'var(--text)', fontWeight: 600 }}>{z.label}</b>
              <span className="num faint">{range}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------- EmergencyBanner --- */
export function EmergencyBanner({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <GlassCard level={2} tint="bad" className="emergency" role="alert">
      <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
        <span className="pulse-dot" style={{ marginTop: 8, flex: 'none' }} />
        <div className="grow stack" style={{ gap: 10 }}>
          <div>
            <div className="h2">This could be an emergency — get urgent help now</div>
            <p className="small muted" style={{ marginTop: 4 }}>Don’t wait to read more. Call an ambulance or go to the nearest emergency room. If someone is unconscious, check breathing.</p>
          </div>
          <div className="row wrap">
            <a className="btn btn-danger" href="tel:112"><Icon name="phone" size={18} />Call 112</a>
            <a className="btn btn-ghost" href="tel:108">Ambulance 108</a>
            {onDismiss && <button className="btn btn-ghost" onClick={onDismiss} style={{ fontSize: 13.5 }}>I’m safe</button>}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/* --------------------------------------------------------- FrostedSkeleton --- */
export function FrostedSkeleton({ lines = 3, height = 14 }: { lines?: number; height?: number }) {
  return (
    <div className="stack" style={{ gap: 10 }} aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => <div key={i} className="skel" style={{ height, width: `${92 - i * 14}%` }} />)}
    </div>
  );
}

/* ------------------------------------------------------- ExplainAgainLadder --- */
export function ExplainAgainLadder({ steps, step, onStep }: { steps: LadderStep[]; step: number; onStep: (i: number) => void }) {
  return (
    <div className="stack">
      <ol className="row" style={{ gap: 6, listStyle: 'none', padding: 0, margin: 0 }} aria-label="Explanation ladder">
        {steps.map((s, i) => (
          <li key={s.label} className="grow">
            <button type="button" onClick={() => onStep(i)} aria-current={i === step} style={{ width: '100%', minHeight: 44, textAlign: 'left' }}>
              <div style={{ height: 4 + i * 3, borderRadius: 4, background: i <= step ? 'var(--accent)' : 'var(--hairline)', transition: 'background .4s' }} />
              <div className="tiny" style={{ marginTop: 6, fontWeight: 700, color: i === step ? 'var(--text)' : 'var(--text-3)' }}>{i + 1}. {s.label}</div>
            </button>
          </li>
        ))}
      </ol>
      <p key={step} className="lede page" style={{ fontSize: 17 }}>{steps[step].text}</p>
    </div>
  );
}

/* ------------------------------------------------------------- Sheet ------ */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <>
      <div className="scrim" onClick={onClose} />
      <GlassCard level={2} className="sheet" role="dialog" aria-modal="true" aria-label={label}>
        <div className="grabber" />
        {children}
      </GlassCard>
    </>,
    document.body,
  );
}

/* ------------------------------------------------------------ PageHeader --- */
export function BackBar({ title, right, to }: { title?: string; right?: ReactNode; to?: string }) {
  return (
    <div className="row between" style={{ minHeight: 48 }}>
      <Link to={to ?? '/'} className="icon-btn" aria-label="Back" onClick={(e) => { if (!to && window.history.length > 1) { e.preventDefault(); window.history.back(); } }}>
        <Icon name="chevronLeft" size={20} />
      </Link>
      {title && <div className="eyebrow">{title}</div>}
      <div className="row">{right ?? <span style={{ width: 44 }} />}</div>
    </div>
  );
}

export function Disclaimer() {
  return (
    <div className="row small muted" style={{ alignItems: 'flex-start', gap: 8 }}>
      <Icon name="info" size={16} style={{ marginTop: 3, flex: 'none' }} />
      <span>We explain, we don’t diagnose. Never change a prescribed medicine without your doctor.</span>
    </div>
  );
}
