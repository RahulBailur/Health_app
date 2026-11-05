import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { GlassCard } from './kit';
import { Icon, type IconName } from './Icon';
import { BrandMark, Thali } from './Art';
import { useStore } from '../lib/store';

/* The table: two thalis under a veil. They turn as you scroll, so the colour
   seen through every glass panel keeps changing. Plus the SVG refraction
   filter used by floating glass. */
export function Ambient() {
  useEffect(() => {
    let raf = 0;
    const set = () => document.documentElement.style.setProperty('--spin', `${(window.scrollY * 0.06).toFixed(2)}deg`);
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(set); };
    set();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <>
      <div className="table" aria-hidden>
        <Thali className="thali" />
        <Thali className="thali second" />
        <div className="veil" />
      </div>
      <div className="grain" aria-hidden />
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <filter id="liquid-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.014" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="40" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </>
  );
}

export { BrandMark };

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/explore', label: 'Explore', icon: 'compass' },
  { to: '/scan', label: 'Scan', icon: 'scan' },
  { to: '/saved', label: 'Saved', icon: 'bookmark' },
  { to: '/profile', label: 'Profile', icon: 'user' },
];

export function GlassBottomNav() {
  return (
    <GlassCard as="nav" level={3} liquid className="bottom-nav" aria-label="Main">
      {NAV.map((n) =>
        n.to === '/scan' ? (
          <Link key={n.to} to={n.to} className="fab" aria-label="Scan a label"><Icon name="scan" size={24} stroke={2.2} /></Link>
        ) : (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon name={n.icon} size={22} />
            <span>{n.label}</span>
          </NavLink>
        ),
      )}
    </GlassCard>
  );
}

const SIDE: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/explore', label: 'Explore', icon: 'compass' },
  { to: '/scan', label: 'Scan a label', icon: 'scan' },
  { to: '/myths', label: 'Myth buster', icon: 'balance' },
  { to: '/compare', label: 'Compare', icon: 'columns' },
  { to: '/conditions', label: 'My condition', icon: 'pulse' },
  { to: '/meal-plan', label: 'Meal plan', icon: 'bowl' },
  { to: '/saved', label: 'Saved', icon: 'bookmark' },
  { to: '/profile', label: 'Profile', icon: 'user' },
];

export function Sidebar() {
  const { theme, setTheme } = useStore();
  return (
    <GlassCard as="aside" level={3} className="sidebar" aria-label="Sidebar">
      <Link to="/" className="brand" style={{ padding: '0 12px 22px' }}><BrandMark />ahaara</Link>
      {SIDE.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
          <Icon name={n.icon} size={20} />{n.label}
        </NavLink>
      ))}
      <div style={{ marginTop: 'auto' }} className="stack">
        <button className="side-link" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />{theme === 'dark' ? 'Daylight' : 'Evening'}
        </button>
        <p className="tiny faint" style={{ padding: '0 14px' }}>We explain, we don’t diagnose.</p>
      </div>
    </GlassCard>
  );
}

export function FloatingSearch({ initial = '', autoFocus = false }: { initial?: string; autoFocus?: boolean }) {
  const [q, setQ] = useState(initial);
  const [listening, setListening] = useState(false);
  const nav = useNavigate();
  const submit = (e?: FormEvent) => { e?.preventDefault(); if (q.trim()) nav(`/ask?q=${encodeURIComponent(q.trim())}`); };

  const startVoice = () => {
    type SR = { lang: string; interimResults: boolean; onresult: (e: { results: { 0: { transcript: string } }[] }) => void; onend: () => void; start: () => void };
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) { setQ('is ragi good for diabetes?'); return; }
    const r = new Ctor();
    r.lang = 'en-IN'; r.interimResults = false;
    r.onresult = (e) => { const t = e.results[0][0].transcript; setQ(t); nav(`/ask?q=${encodeURIComponent(t)}`); };
    r.onend = () => setListening(false);
    setListening(true); r.start();
  };

  return (
    <GlassCard as="form" level={3} liquid className="search" onSubmit={submit} role="search">
      <Icon name="search" size={20} style={{ color: 'var(--text-2)', flex: 'none' }} />
      <label className="sr-only" htmlFor="ask">Ask anything</label>
      <input
        id="ask" value={q} onChange={(e) => setQ(e.target.value)} autoFocus={autoFocus} enterKeyHint="search" autoComplete="off"
        placeholder="Ask anything — ‘is ragi good for diabetes?’"
      />
      <button type="button" className="icon-btn" aria-label={listening ? 'Listening' : 'Ask by voice'} onClick={startVoice}
        style={listening ? { color: 'var(--accent)', boxShadow: '0 0 0 2px var(--accent)' } : undefined}>
        <Icon name="mic" size={20} />
      </button>
      <Link to="/scan" className="icon-btn" aria-label="Scan a label"><Icon name="camera" size={20} /></Link>
    </GlassCard>
  );
}
