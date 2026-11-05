import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Icon, type IconName } from './Icon';
import { BrandMark, Thali } from './Art';
import { Liquid, haptic } from './liquid';
import { useStore } from '../lib/store';

/* The table: two thalis under a veil. They turn as you scroll, so what you see
   through every piece of glass keeps changing. */
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
    </>
  );
}

export { BrandMark };

/* ---------------------------------------------- tab bar accessory slot ------ */
/* Like iOS 26's tab bar accessory: a page can park a small glass bar above the
   tab bar; it folds in beside the tabs when the bar shrinks on scroll. */
const AccessoryCtx = createContext<{ node: ReactNode; set: (n: ReactNode) => void }>({ node: null, set: () => undefined });
export function AccessoryProvider({ children }: { children: ReactNode }) {
  const [node, set] = useState<ReactNode>(null);
  return <AccessoryCtx.Provider value={{ node, set }}>{children}</AccessoryCtx.Provider>;
}
export function useTabAccessory(node: ReactNode, deps: unknown[]) {
  const { set } = useContext(AccessoryCtx);
  useEffect(() => { set(node); return () => set(null); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/* ------------------------------------------------------------ tab bar ------- */
const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/explore', label: 'Explore', icon: 'compass' },
  { to: '/saved', label: 'Saved', icon: 'bookmark' },
  { to: '/profile', label: 'Profile', icon: 'user' },
];

const activeTab = (path: string) =>
  path === '/' ? '/' : TABS.find((t) => t.to !== '/' && path.startsWith(t.to))?.to
    ?? (/^\/(ask|article|myths|compare|conditions|meal-plan|product)/.test(path) ? '/explore' : '/');

/** iOS-style floating glass tab bar. A droplet slides to the active tab; the bar
    shrinks to the current tab while you scroll down. Scan sits apart as the
    tinted primary action. */
export function TabBar() {
  const { pathname } = useLocation();
  const { node: accessory } = useContext(AccessoryCtx);
  const current = activeTab(pathname);
  const [drop, setDrop] = useState<{ x: number; w: number } | null>(null);
  const [moving, setMoving] = useState(false);
  const first = useRef(true);

  useLayoutEffect(() => {
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`.tabbar [data-tab="${current}"]`);
      if (el) setDrop({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const bar = document.querySelector('.tabbar');
    const ro = new ResizeObserver(measure); // the bar grows back after minimising
    if (bar) ro.observe(bar);
    if (first.current) { first.current = false; return () => ro.disconnect(); }
    setMoving(true);
    const t = setTimeout(() => setMoving(false), 560);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [current]);

  const expand = () => { if (document.documentElement.dataset.dir === 'down') { document.documentElement.dataset.dir = 'up'; haptic(); } };

  return (
    <nav className={`tabbar-wrap ${accessory ? 'has-accessory' : ''}`} aria-label="Main">
      {accessory && <Liquid as="div" className="accessory" bezel={16}>{accessory}</Liquid>}
      <Liquid as="div" className="tabbar" bezel={20} onClickCapture={expand}>
        {drop && <span className={`tab-droplet ${moving ? 'moving' : ''}`} style={{ transform: `translateX(${drop.x}px)`, width: drop.w }} aria-hidden />}
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} data-tab={t.to} onClick={() => haptic()}
            className={() => `tab ${current === t.to ? 'active' : ''}`} aria-current={current === t.to ? 'page' : undefined}>
            <Icon name={t.icon} size={23} stroke={current === t.to ? 2.1 : 1.8} />
            <span className="lbl">{t.label}</span>
          </NavLink>
        ))}
      </Liquid>
      <Liquid as={Link} to="/scan" className="tab-action" tint="turmeric" bezel={18} dispersion aria-label="Scan a label" onClick={() => haptic(12)}>
        <Icon name="scan" size={26} stroke={2.2} />
      </Liquid>
    </nav>
  );
}

/* ------------------------------------------------------------ sidebar ------- */
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
    <Liquid as="aside" radius={30} bezel={22} strength={0.6} className="sidebar" aria-label="Sidebar">
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
    </Liquid>
  );
}

/* ------------------------------------------------------------- search ------- */
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
    setListening(true); haptic(); r.start();
  };

  return (
    <Liquid as="form" className="search" bezel={22} dispersion onSubmit={submit} role="search">
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
    </Liquid>
  );
}
