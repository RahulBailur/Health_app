import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { StoreProvider } from './lib/store';
import { AccessoryProvider } from './components/chrome';
import './styles.css';

/* Real refraction needs Chromium (SVG filters in backdrop-filter) and some GPU
   headroom. Low-end phones default to simple frosted glass; Profile can switch. */
const nav = navigator as Navigator & { userAgentData?: { brands: { brand: string }[] }; deviceMemory?: number };
const chromium = (nav.userAgentData?.brands ?? []).some((b) => /Chromium|Google Chrome/.test(b.brand));
let glassPref: string | null = null;
try { glassPref = localStorage.getItem('ahaara.glass'); } catch { /* storage blocked */ }
const lowEnd = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) < 4;
if (chromium && (glassPref === 'liquid' || (!glassPref && !lowEnd))) document.documentElement.classList.add('supports-liquid');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <AccessoryProvider>
          <App />
        </AccessoryProvider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
