import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiNote, AiTag, GlassCard, Sheet, VerdictBadge } from '../components/kit';
import { Icon } from '../components/Icon';
import { productById } from '../data/products';
import type { Product } from '../data/types';
import { runTask, shrinkImage, toContext, toProduct, useAiStatus, type LabelAIT } from '../lib/ai';
import { useStore } from '../lib/store';

const RED_FLAGS = ['maltodextrin', 'invert syrup', 'invert sugar', 'dextrose', 'liquid glucose', 'glucose syrup', 'corn syrup', 'palm oil', 'palmolein', 'hydrogenated', 'interesterified', 'vanaspati', 'sugar'];

const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function Highlighted({ text, extra = [] }: { text: string; extra?: string[] }) {
  const words = [...new Set([...RED_FLAGS, ...extra.map((w) => w.toLowerCase())])].filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(esc);
  const re = new RegExp(`(${words.join('|')})`, 'gi');
  return <>{text.split(re).map((part, i) => (words.some((w) => new RegExp(`^${w}$`, 'i').test(part)) ? <mark key={i} className="flag">{part}</mark> : <span key={i}>{part}</span>))}</>;
}

type Result = { product: Product; redFlags: string[]; provider?: string; demo: boolean };

export default function Scanner() {
  const video = useRef<HTMLVideoElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [cam, setCam] = useState<'pending' | 'live' | 'none'>('pending');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [problem, setProblem] = useState('');
  const nav = useNavigate();
  const { profile, ai, addAiProduct } = useStore();
  const status = useAiStatus();
  const aiCanRead = Boolean(status?.vision);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) { setCam('none'); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } }, audio: false })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        stream = s;
        if (video.current) { video.current.srcObject = s; video.current.play().catch(() => undefined); }
        setCam('live');
      })
      .catch(() => setCam('none'));
    return () => { cancelled = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const readWithAi = async (image: string) => {
    setScanning(true); setProblem('');
    const r = await runTask<LabelAIT>('label', { image, profile: toContext(profile) }, ai);
    setScanning(false);
    if (!r.ok) { setProblem(r.message ?? 'Couldn’t read the label. Try again.'); return; }
    if (!r.data.readable) { setProblem(r.data.problem || 'That didn’t look like a readable food label. Try more light and hold steady.'); return; }
    const product = toProduct(r.data.product, r.providerLabel);
    addAiProduct(product);
    setResult({ product, redFlags: r.data.redFlags, provider: r.providerLabel, demo: false });
  };

  const capture = async () => {
    if (aiCanRead && cam === 'live' && video.current?.videoWidth) {
      readWithAi(await shrinkImage(video.current));
      return;
    }
    // demo: no AI with photo reading, or no camera — show the sample label
    setScanning(true);
    setTimeout(() => { setScanning(false); setResult({ product: productById('multigrain-biscuits')!, redFlags: [], demo: true }); }, 1100);
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) readWithAi(await shrinkImage(f));
  };

  const p = result?.product;
  const flagsFound = p ? p.ingredients.split(new RegExp(`(${[...RED_FLAGS, ...(result?.redFlags ?? [])].filter(Boolean).map(esc).join('|')})`, 'gi')).filter((_, i) => i % 2).length : 0;

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
          <Icon name={aiCanRead ? 'spark' : 'scan'} size={16} />
          {scanning ? 'Reading the label…' : aiCanRead ? (cam === 'live' ? 'AI label reading' : 'Upload a label photo') : cam === 'live' ? 'Camera on · demo' : 'Demo label'}
        </GlassCard>
        <button className="icon-btn glass floating" aria-label="Upload a photo" onClick={() => file.current?.click()} style={{ color: '#fff' }} disabled={!aiCanRead}>
          <Icon name="image" size={20} />
        </button>
        <input ref={file} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
      </div>

      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(28px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        {problem ? (
          <GlassCard level={3} tint="bad" className="ribbon" style={{ color: '#fff', maxWidth: 380 }} role="alert">
            <Icon name="alert" size={18} style={{ flex: 'none' }} /><span className="small">{problem}</span>
          </GlassCard>
        ) : (
          <GlassCard level={3} className="chip" style={{ color: '#fff', minHeight: 40, padding: '0 16px' }}>
            Point at the nutrition table + ingredients
          </GlassCard>
        )}
        <button onClick={capture} aria-label="Capture label" disabled={scanning}
          style={{ width: 78, height: 78, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.18)', boxShadow: 'inset 0 0 0 3px rgba(255,255,255,.85), 0 10px 30px rgba(0,0,0,.4)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
          <span style={{ width: 60, height: 60, borderRadius: '50%', background: scanning ? 'var(--turmeric)' : '#fff', transition: 'background .3s, transform .3s', transform: scanning ? 'scale(.85)' : 'none' }} />
        </button>
        <p className="tiny" style={{ color: 'rgba(255,255,255,.75)', textAlign: 'center', maxWidth: 300 }}>
          {aiCanRead ? 'Your photo is read by AI and then discarded. Check the numbers against the pack.' : 'Demo mode: label reading needs an AI key with photo support (see README).'}
        </p>
      </div>

      <Sheet open={!!result} onClose={() => setResult(null)} label="Scan result">
        {p && (
          <div className="stack">
            <div className="row between">
              <h2 className="h2">{result.demo ? 'Label read' : p.name}</h2>
              {result.provider ? <AiTag provider={result.provider} confidence={p.ai?.confidence} /> : <span className="illus">sample · per 100 g</span>}
            </div>
            {!result.demo && <div><VerdictBadge v={p.verdict} pulse /></div>}
            <div className="tiles" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {([['Sugar', `${p.per100.sugar} g`, p.per100.sugar > 15 ? 'var(--bad)' : 'var(--text)'], ['Protein', `${p.per100.protein} g`, 'var(--text)'], ['Salt', `${p.per100.salt} g`, p.per100.salt > 1.25 ? 'var(--bad)' : 'var(--text)'], ['Energy', `${p.per100.kcal}`, 'var(--text)'], ['Fibre', `${p.per100.fibre} g`, 'var(--text)'], ['Per', '100 g', 'var(--text-3)']] as const).map(([l, v, c]) => (
                <GlassCard key={l} style={{ padding: 12, borderRadius: 16 }}>
                  <div className="tiny faint" style={{ fontWeight: 700 }}>{l}</div>
                  <div className="h3 num" style={{ color: c }}>{v}</div>
                </GlassCard>
              ))}
            </div>
            <div>
              <div className="row between" style={{ marginBottom: 6 }}><span className="eyebrow">Ingredients</span><span className="tiny" style={{ color: 'var(--bad)', fontWeight: 700 }}>{flagsFound} red flag{flagsFound === 1 ? '' : 's'}</span></div>
              <p className="small" style={{ lineHeight: 1.8 }}><Highlighted text={p.ingredients} extra={result.redFlags} /></p>
            </div>
            <p className="tiny muted">Red flags: hidden sugars (maltodextrin, invert syrup, dextrose), palm oil and hydrogenated fats.</p>
            {!result.demo && <AiNote />}
            <button className="btn btn-primary" onClick={() => nav(`/product/${p.id}`)}>Get verdict<Icon name="arrowRight" size={18} /></button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
