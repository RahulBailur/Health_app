import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Ambient, GlassBottomNav, Sidebar } from './components/chrome';
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

/* Pointer-tracked specular highlight: sets --mx/--my on the glass under the
   finger/cursor so the sheen follows it. One delegated listener for the app. */
function useSpecular() {
  useEffect(() => {
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = (e.target as Element | null)?.closest?.('.glass') as HTMLElement | null;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerdown', onMove); };
  }, []);
}

export default function App() {
  const loc = useLocation();
  useSpecular();
  useEffect(() => { if (!loc.pathname.startsWith('/product')) window.scrollTo(0, 0); }, [loc.pathname]);
  const fullBleed = loc.pathname === '/scan';

  return (
    <>
      <Ambient />
      <div className="app">
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
        {!fullBleed && <GlassBottomNav />}
      </div>
    </>
  );
}
