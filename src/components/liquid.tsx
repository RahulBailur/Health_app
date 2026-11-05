/* ==========================================================================
   Liquid Glass for the web.

   Each <Liquid> element gets its own refraction map, computed for its exact
   size: a convex squircle bezel bends the backdrop like a real glass edge
   (Snell's law, n = 1.5), optionally with a little chromatic dispersion and a
   magnifying centre for lenses. Chromium renders the map through
   `backdrop-filter: url(#…)`; other browsers get a frosted fallback.
   Specular rims follow a global light angle (--light) driven by the pointer
   or the phone's tilt, and glass lights up from the point you touch.
   ========================================================================== */
import {
  useCallback, useEffect, useId, useLayoutEffect, useRef, useState,
  type CSSProperties, type ElementType, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export const lensSupported = () => typeof document !== 'undefined' && document.documentElement.classList.contains('supports-liquid');
export const haptic = (ms = 8) => { try { navigator.vibrate?.(ms); } catch { /* not supported */ } };

/* ---------------------------------------------------------- refraction map --- */
interface MapSpec { w: number; h: number; radius: number; bezel: number; magnify: number }
interface LensMap { url: string; scale: number; w: number; h: number }
const mapCache = new Map<string, LensMap>();

function buildMap({ w, h, radius, bezel, magnify }: MapSpec): LensMap {
  const key = `${w}|${h}|${radius}|${bezel}|${magnify}`;
  const hit = mapCache.get(key);
  if (hit) return hit;

  const res = w * h > 120_000 ? 0.5 : 1; // big surfaces: half-resolution map, stretched by feImage
  const cw = Math.max(2, Math.round(w * res));
  const ch = Math.max(2, Math.round(h * res));
  const hw = w / 2, hh = h / 2;
  const r = Math.min(radius, hw, hh);
  const n = 1.5; // refractive index of glass
  const thickness = bezel * 0.85;
  const vx = new Float32Array(cw * ch);
  const vy = new Float32Array(cw * ch);
  let max = 0.0001;

  for (let j = 0; j < ch; j++) {
    for (let i = 0; i < cw; i++) {
      const px = (i + 0.5) / res, py = (j + 0.5) / res;
      const ax = Math.abs(px - hw), ay = Math.abs(py - hh);
      const qx = ax - (hw - r), qy = ay - (hh - r);
      let dist: number, nx: number, ny: number; // distance in from the rim, outward normal
      if (qx > 0 && qy > 0) {
        const l = Math.hypot(qx, qy) || 1;
        dist = r - l; nx = qx / l; ny = qy / l;
      } else if (hw - ax < hh - ay) {
        dist = hw - ax; nx = 1; ny = 0;
      } else {
        dist = hh - ay; nx = 0; ny = 1;
      }
      nx *= Math.sign(px - hw) || 1;
      ny *= Math.sign(py - hh) || 1;

      let dx = 0, dy = 0;
      if (dist >= 0 && dist < bezel) {
        // convex squircle profile: height = (1 - (1 - t)^4)^(1/4)
        const t = dist / bezel;
        const u = 1 - t;
        const base = Math.max(1e-6, 1 - u ** 4);
        const slope = Math.min(40, u ** 3 / base ** 0.75);
        const tilt = Math.atan((slope * thickness) / bezel); // surface angle
        const refracted = Math.asin(Math.sin(tilt) / n); // Snell–Descartes
        const shift = thickness * base ** 0.25 * Math.tan(tilt - refracted);
        dx = -nx * shift; dy = -ny * shift; // sample from further in: the rim magnifies
      }
      if (magnify && dist >= 0) { dx -= (px - hw) * magnify; dy -= (py - hh) * magnify; }
      const k = j * cw + i;
      vx[k] = dx; vy[k] = dy;
      max = Math.max(max, Math.abs(dx), Math.abs(dy));
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(cw, ch);
  for (let k = 0; k < cw * ch; k++) {
    img.data[k * 4] = Math.round(128 + 127 * (vx[k] / max));
    img.data[k * 4 + 1] = Math.round(128 + 127 * (vy[k] / max));
    img.data[k * 4 + 2] = 128;
    img.data[k * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const out = { url: canvas.toDataURL('image/png'), scale: max * 2, w, h };
  if (mapCache.size > 80) mapCache.delete(mapCache.keys().next().value as string);
  mapCache.set(key, out);
  return out;
}

function LensFilter({ id, map, strength, dispersion }: { id: string; map: LensMap; strength: number; dispersion: boolean }) {
  const s = map.scale * strength;
  const disp = (scale: number, result?: string) => (
    <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result={result} />
  );
  return (
    <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden>
      <defs>
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage href={map.url} x="0" y="0" width={map.w} height={map.h} preserveAspectRatio="none" result="map" />
          {dispersion ? (
            <>
              {disp(s, 'dr')}
              <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
              {disp(s * 0.94, 'dg')}
              <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
              {disp(s * 0.88, 'db')}
              <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
              <feBlend in="r" in2="g" mode="screen" result="rg" />
              <feBlend in="rg" in2="b" mode="screen" />
            </>
          ) : disp(s)}
        </filter>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------- <Liquid> ----- */
type LiquidProps = {
  as?: ElementType;
  /** corner radius in px, or 'capsule' */
  radius?: number | 'capsule';
  /** width of the curved rim in px */
  bezel?: number;
  /** multiplies the refraction */
  strength?: number;
  /** magnify the centre (0–0.5), for lenses */
  magnify?: number;
  /** split colours slightly at the rim, like real glass */
  dispersion?: boolean;
  /** tinted glass for primary actions */
  tint?: 'turmeric' | 'chilli';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
};

export function Liquid({
  as: Tag = 'div', radius = 'capsule', bezel = 14, strength = 1, magnify = 0, dispersion = false, tint, className = '', style, children, ...rest
}: LiquidProps) {
  const local = useRef<HTMLElement | null>(null);
  const id = `lg${useId().replace(/[^a-z0-9]/gi, '')}`;
  const [map, setMap] = useState<LensMap | null>(null);
  const setRef = useCallback((el: HTMLElement | null) => { local.current = el; }, []);

  useLayoutEffect(() => {
    const el = local.current;
    if (!el || !lensSupported()) return;
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
        if (w < 8 || h < 8) return;
        const r = radius === 'capsule' ? Math.min(w, h) / 2 : radius;
        setMap((m) => (m && m.w === w && m.h === h ? m : buildMap({ w, h, radius: r, bezel: Math.min(bezel, r || bezel), magnify })));
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [radius, bezel, magnify]);

  const cls = ['lg', tint && `lg-tint-${tint}`, className].filter(Boolean).join(' ');
  const css = {
    ...style,
    ...(radius !== 'capsule' ? { borderRadius: radius } : {}),
    ...(map ? { '--lg-lens': `url(#${id})` } : {}),
  } as CSSProperties;

  return (
    <>
      <Tag ref={setRef} className={cls} style={css} {...rest}>
        {children}
        <span className="lg-rim" aria-hidden />
      </Tag>
      {map && createPortal(<LensFilter id={id} map={map} strength={strength} dispersion={dispersion} />, document.body)}
    </>
  );
}

/* ------------------------------------------------------- light & touch ------ */
/** Points the specular highlights at the pointer (desktop) or follows the phone's tilt. */
export function useLightSource() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const set = (deg: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => root.style.setProperty('--light', `${(((deg % 360) + 360) % 360).toFixed(1)}deg`));
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const dx = e.clientX - innerWidth / 2;
      const dy = e.clientY - innerHeight * 0.35;
      set((Math.atan2(dx, -dy) * 180) / Math.PI);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      set(320 + e.gamma * 1.4 + (e.beta - 45) * 0.5);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('deviceorientation', onTilt, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('deviceorientation', onTilt); };
  }, []);
}

/** Glass lights up from the touch point and flexes while pressed. */
export function useTouchGlow() {
  useEffect(() => {
    const down = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.('.lg, .glass') as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
      el.dataset.pressed = '';
      const up = () => { delete el.dataset.pressed; window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest?.('.lg, .glass') as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); };
  }, []);
}

/* --------------------------------------------------------- Segmented -------- */
/** iOS-style segmented control: a glass droplet slides (and stretches) to the choice. */
export function Segmented<T extends string>({ options, value, onChange, label, className = '' }: {
  options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; label: string; className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  const [moving, setMoving] = useState(false);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const btn = el.querySelector<HTMLElement>(`[data-v="${CSS.escape(value)}"]`);
      if (btn) setThumb({ x: btn.offsetLeft, w: btn.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [value, options.length]);

  const pick = (v: T) => {
    if (v === value) return;
    setMoving(true);
    setTimeout(() => setMoving(false), 420);
    haptic();
    onChange(v);
  };

  return (
    <div ref={wrap} className={`seg ${className}`} role="radiogroup" aria-label={label}>
      {thumb && <span className={`seg-thumb ${moving ? 'moving' : ''}`} style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }} aria-hidden />}
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === value} data-v={o.value} onClick={() => pick(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
