import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Sheet } from '../components/kit';
import { Icon } from '../components/Icon';
import { productById } from '../data/products';

const RED_FLAGS = ['maltodextrin', 'invert syrup', 'dextrose', 'liquid glucose', 'corn syrup', 'palm oil', 'hydrogenated', 'vanaspati', 'sugar'];

function Highlighted({ text }: { text: string }) {
  const re = new RegExp(`(${RED_FLAGS.join('|')})`, 'gi');
  return <>{text.split(re).map((part, i) => (RED_FLAGS.includes(part.toLowerCase()) ? <mark key={i} className="flag">{part}</mark> : <span key={i}>{part}</span>))}</>;
}

export default function Scanner() {
  const video = useRef<HTMLVideoElement>(null);
  const [cam, setCam] = useState<'pending' | 'live' | 'none'>('pending');
  const [torch, setTorch] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [sheet, setSheet] = useState(false);
  const nav = useNavigate();
  const sample = productById('multigrain-biscuits')!;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) { setCam('none'); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        stream = s;
        if (video.current) { video.current.srcObject = s; video.current.play().catch(() => undefined); }
        setCam('live');
      })
      .catch(() => setCam('none'));
    return () => { cancelled = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const capture = () => { setScanning(true); setTimeout(() => { setScanning(false); setSheet(true); }, 1100); };

  return (
    <div className="scanner">
      <video ref={video} playsInline muted style={{ display: cam === 'live' ? 'block' : 'none' }} />
      {cam !== 'live' && (
        <div className="fake-cam" aria-hidden>
          <div className="fake-label">
            <b style={{ fontSize: 11 }}>NUTRITION INFORMATION</b> (per 100 g)
            <table><tbody>
              <tr><td>Energy</td><td align="right">486 kcal</td></tr>
              <tr><td>Protein</td><td align="right">7.0 g</td></tr>
              <tr><td>Carbohydrate</td><td align="right">68 g</td></tr>
              <tr><td>&nbsp; of which sugars</td><td align="right">18 g</td></tr>
              <tr><td>Fat</td><td align="right">20 g</td></tr>
              <tr><td>Sodium</td><td align="right">320 mg</td></tr>
            </tbody></table>
            <p style={{ marginTop: 6 }}><b>INGREDIENTS:</b> Refined wheat flour, sugar, palm oil, whole wheat flour, oats, ragi, invert syrup…</p>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 45% at 50% 44%, transparent 60%, rgba(0,0,0,.55) 100%)' }} />

      <div className="frame" aria-hidden>
        <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
        {(scanning || cam !== 'pending') && <span className="laser" />}
      </div>

      <div className="row between" style={{ position: 'absolute', top: 'max(16px, env(safe-area-inset-top))', left: 16, right: 16 }}>
        <button className="icon-btn glass floating" aria-label="Close scanner" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))} style={{ color: '#fff' }}><Icon name="close" size={20} /></button>
        <GlassCard level={3} className="chip" style={{ color: '#fff', minHeight: 40 }}>
          <Icon name="scan" size={16} />{cam === 'live' ? 'Camera on' : cam === 'pending' ? 'Starting camera…' : 'Demo label'}
        </GlassCard>
        <button className="icon-btn glass floating" aria-label="Torch" aria-pressed={torch} onClick={() => setTorch(!torch)} style={{ color: torch ? 'var(--accent)' : '#fff' }}><Icon name="flash" size={20} /></button>
      </div>

      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(28px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <GlassCard level={3} className="chip" style={{ color: '#fff', minHeight: 40, padding: '0 16px' }}>
          Point at the nutrition table + ingredients
        </GlassCard>
        <button onClick={capture} aria-label="Capture label" disabled={scanning}
          style={{ width: 78, height: 78, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.18)', boxShadow: 'inset 0 0 0 3px rgba(255,255,255,.85), 0 10px 30px rgba(0,0,0,.4)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
          <span style={{ width: 60, height: 60, borderRadius: '50%', background: scanning ? 'var(--accent)' : '#fff', transition: 'background .3s, transform .3s', transform: scanning ? 'scale(.85)' : 'none' }} />
        </button>
        <p className="tiny" style={{ color: 'rgba(255,255,255,.75)', textAlign: 'center', maxWidth: 300 }}>
          Preview build: label reading is simulated with a sample biscuit label.
        </p>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} label="Scan result">
        <div className="stack">
          <div className="row between"><h2 className="h2">Label read</h2><span className="illus">sample · per 100 g</span></div>
          <div className="tiles" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[['Sugar', `${sample.per100.sugar} g`, 'var(--bad)'], ['Protein', `${sample.per100.protein} g`, 'var(--text)'], ['Salt', `${sample.per100.salt} g`, 'var(--moderate)'], ['Energy', `${sample.per100.kcal}`, 'var(--text)'], ['Fat', '20 g', 'var(--moderate)'], ['Fibre', `${sample.per100.fibre} g`, 'var(--text)']].map(([l, v, c]) => (
              <GlassCard key={l} style={{ padding: 12, borderRadius: 16 }}>
                <div className="tiny faint" style={{ fontWeight: 700 }}>{l}</div>
                <div className="h3 num" style={{ color: c }}>{v}</div>
              </GlassCard>
            ))}
          </div>
          <div>
            <div className="row between" style={{ marginBottom: 6 }}><span className="eyebrow">Ingredients</span><span className="tiny" style={{ color: 'var(--bad)', fontWeight: 700 }}>4 red flags</span></div>
            <p className="small" style={{ lineHeight: 1.8 }}><Highlighted text={sample.ingredients} /></p>
          </div>
          <p className="tiny muted">Red flags: hidden sugars (maltodextrin, invert syrup, dextrose), palm oil and hydrogenated fats.</p>
          <button className="btn btn-primary" onClick={() => nav(`/product/${sample.id}`)}>Get verdict<Icon name="arrowRight" size={18} /></button>
        </div>
      </Sheet>
    </div>
  );
}
