import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../data/types';

export type Theme = 'dark' | 'light';
export interface Profile {
  name: string;
  diet: string;
  allergies: string[];
  conditions: string[];
  country: string;
  units: 'metric' | 'household';
}

interface Store {
  theme: Theme;
  setTheme: (t: Theme) => void;
  saved: string[]; // "product:<id>" | "myth:<id>"
  toggleSaved: (key: string) => void;
  profile: Profile;
  setProfile: (p: Profile) => void;
  /** AI settings: chosen engine ("auto" or a provider id) and optional access code */
  ai: { provider: string; code: string };
  setAi: (a: { provider: string; code: string }) => void;
  /** Verdicts the AI wrote, kept on this device so they can be reopened and saved */
  aiProducts: Record<string, Product>;
  addAiProduct: (p: Product) => void;
}

const Ctx = createContext<Store | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable: keep in memory */ }
}

const defaultProfile: Profile = {
  name: 'Ananya', diet: 'Vegetarian', allergies: ['Peanuts'], conditions: ['Prediabetes'], country: 'India', units: 'household',
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => read<Theme>('ahaara.theme', 'dark'));
  const [saved, setSaved] = useState<string[]>(() =>
    read('ahaara.saved', ['product:chocolate-protein-drink', 'product:ragi-flour', 'myth:jaggery-better', 'product:packaged-fruit-juice', 'product:herbal-slimming-tea', 'myth:curd-night']),
  );
  const [profile, setProfileState] = useState<Profile>(() => read('ahaara.profile', defaultProfile));
  const [ai, setAi] = useState(() => read('ahaara.ai', { provider: 'auto', code: '' }));
  const [aiProducts, setAiProducts] = useState<Record<string, Product>>(() => read('ahaara.aiProducts', {}));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#120E0B' : '#EFE8DC');
    write('ahaara.theme', theme);
  }, [theme]);
  useEffect(() => write('ahaara.saved', saved), [saved]);
  useEffect(() => write('ahaara.profile', profile), [profile]);
  useEffect(() => write('ahaara.ai', ai), [ai]);
  useEffect(() => write('ahaara.aiProducts', aiProducts), [aiProducts]);
  const addAiProduct = useCallback((p: Product) => setAiProducts((m) => ({ ...m, [p.id]: p })), []);

  const toggleSaved = useCallback((key: string) => {
    setSaved((s) => (s.includes(key) ? s.filter((k) => k !== key) : [key, ...s]));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme: setThemeState, saved, toggleSaved, profile, setProfile: setProfileState, ai, setAi, aiProducts, addAiProduct }),
    [theme, saved, toggleSaved, profile, ai, aiProducts, addAiProduct],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}
