import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { StoreProvider } from './lib/store';
import './styles.css';

/* Chromium can refract through an SVG filter in backdrop-filter; others get plain blur. */
const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands ?? [];
if (brands.some((b) => /Chromium|Google Chrome/.test(b.brand))) document.documentElement.classList.add('supports-liquid');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
