import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#120E0B' : '#EFE8DC');
    write('ahaara.theme', theme);
  }, [theme]);
  useEffect(() => write('ahaara.saved', saved), [saved]);
  useEffect(() => write('ahaara.profile', profile), [profile]);

  const toggleSaved = useCallback((key: string) => {
    setSaved((s) => (s.includes(key) ? s.filter((k) => k !== key) : [key, ...s]));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme: setThemeState, saved, toggleSaved, profile, setProfile: setProfileState }),
    [theme, saved, toggleSaved, profile],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}
