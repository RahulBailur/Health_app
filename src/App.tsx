import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Ambient, Sidebar, TabBar } from './components/chrome';
import { useLightSource, useTouchGlow } from './components/liquid';
import Home from './screens/Home';
import Verdict from './screens/Verdict';
import Scanner from './screens/Scanner';
import Article from './screens/Article';
import Myths from './screens/Myths';
import Compare from './screens/Compare';
import ConditionPage, { ConditionPicker } from './screens/Conditions';
import MealPlan from './screens/MealPlan';
import { Profile, Saved } from './screens/Personal';
import { Ask, Explore } from './screens/Explore';
import Kit from './screens/Kit';

/** Marks the page as scrolled (for the scroll-edge blur) and tracks direction
    (the tab bar shrinks while you scroll down, returns when you scroll up). */
function useScrollState() {
  const { pathname } = useLocation();
  useEffect(() => {
    const root = document.documentElement;
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      root.toggleAttribute('data-scrolled', y > 6);
      if (Math.abs(y - last) > 8) {
        root.dataset.dir = y > last && y > 140 ? 'down' : 'up';
        last = y;
      }
      if (y < 40) root.dataset.dir = 'up';
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { document.documentElement.dataset.dir = 'up'; }, [pathname]);
}

/** Page transitions: every in-app link navigates inside a View Transition, so
    pages cross-fade and shared elements (product art) fly between screens. */
function useViewTransitions() {
  const navigate = useNavigate();
  useEffect(() => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
    if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target || a.hasAttribute('download') || a.hasAttribute('data-back') || a.origin !== location.origin) return;
      const to = a.pathname + a.search + a.hash;
      if (to === location.pathname + location.search + location.hash) return;
      e.preventDefault();
      document.documentElement.classList.add('vt');
      const t = doc.startViewTransition!(() => { flushSync(() => navigate(to)); window.scrollTo(0, 0); });
      t.finished.finally(() => document.documentElement.classList.remove('vt'));
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate]);
}

export default function App() {
  const loc = useLocation();
  useScrollState();
  useLightSource();
  useTouchGlow();
  useViewTransitions();
  useEffect(() => { if (!loc.pathname.startsWith('/product')) window.scrollTo(0, 0); }, [loc.pathname]);
  const fullBleed = loc.pathname === '/scan';

  return (
    <>
      <Ambient />
      <div className="app">
        {/* scroll-edge effect: inside .app so it sits under the floating glass, not over it */}
        <div className="edge edge-top" aria-hidden />
        {!fullBleed && <div className="edge edge-bottom" aria-hidden />}
        {!fullBleed && <Sidebar />}
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/ask" element={<Ask />} />
            <Route path="/product/:id" element={<Verdict />} />
            <Route path="/scan" element={<Scanner />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/myths" element={<Myths />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/conditions" element={<ConditionPicker />} />
            <Route path="/conditions/:id" element={<ConditionPage />} />
            <Route path="/meal-plan" element={<MealPlan />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/kit" element={<Kit />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        {!fullBleed && <TabBar />}
      </div>
    </>
  );
}
