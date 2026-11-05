import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AiNote, AiTag, BackBar, EvidenceChip, GlassCard, VerdictBadge } from '../components/kit';
import { Icon } from '../components/Icon';
import { myths } from '../data/content';
import type { Myth } from '../data/types';
import { matchForward } from '../lib/ask';
import { runTask, toContext, toMyth, useAiStatus, type MythAIT } from '../lib/ai';
import { useStore } from '../lib/store';

const mythVerdict = {
  true: { v: 'good' as const, label: 'True' },
  partly: { v: 'moderate' as const, label: 'Partly true' },
  myth: { v: 'bad' as const, label: 'Myth' },
};

/* ------------------------------------------------------------ MythFlipCard --- */
export function MythFlipCard({ m, onNext, interactive = true }: { m: Myth; onNext?: (dir: 1 | -1) => void; interactive?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const [guess, setGuess] = useState<'true' | 'myth' | null>(null);
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const { saved, toggleSaved } = useStore();
  const key = `myth:${m.id}`;
  const mv = mythVerdict[m.verdict];

  const reveal = (g: 'true' | 'myth') => { setGuess(g); setFlipped(true); };
  const right = guess && (guess === 'myth' ? m.verdict !== 'true' : m.verdict !== 'myth');

  const onDown = (e: PointerEvent) => { if (!interactive || flipped) return; start.current = { x: e.clientX, y: e.clientY }; (e.target as Element).setPointerCapture?.(e.pointerId); };
  const onMove = (e: PointerEvent) => { if (!start.current) return; setDx(e.clientX - start.current.x); };
  const onUp = () => {
    if (!start.current) return;
    start.current = null;
    if (dx > 90) reveal('true'); else if (dx < -90) reveal('myth');
    setDx(0);
  };

  const tilt = flipped ? '' : `translateX(${dx}px) rotate(${dx / 18}deg)`;
  return (
    <div className="myth-stack" style={{ height: 480 }}>
      <div className="myth-under glass" style={{ transform: 'translateY(16px) scale(0.92)', opacity: 0.5 }} aria-hidden />
      <div className="myth-under glass" style={{ transform: 'translateY(8px) scale(0.96)', opacity: 0.75 }} aria-hidden />
      <div style={{ position: 'absolute', inset: 0, transform: tilt, transition: start.current ? 'none' : 'transform .45s var(--spring)' }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <div className={`myth-card ${flipped ? 'flipped' : ''}`}>
          {/* front */}
          <GlassCard level={2} className="myth-face" aria-hidden={flipped}>
            <span className="swipe-hint" style={{ left: 20, color: 'var(--good)', opacity: Math.max(0, dx / 90), transform: 'rotate(-10deg)' }}>True</span>
            <span className="swipe-hint" style={{ right: 20, color: 'var(--bad)', opacity: Math.max(0, -dx / 90), transform: 'rotate(10deg)' }}>Myth</span>
            <div className="eyebrow">You’ve probably heard…</div>
            <div className="grow" style={{ display: 'grid', placeItems: 'center' }}>
              <p className="h-display" style={{ textAlign: 'center', fontSize: 31 }}>“{m.claim}”</p>
            </div>
            <p className="small faint" style={{ textAlign: 'center', marginBottom: 14 }}>Swipe right for true, left for myth — or tap</p>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn-ghost grow" onClick={() => reveal('myth')} disabled={flipped}><Icon name="x" size={18} stroke={2.4} style={{ color: 'var(--bad)' }} />Myth</button>
              <button className="btn btn-ghost grow" onClick={() => reveal('true')} disabled={flipped}><Icon name="check" size={18} stroke={2.4} style={{ color: 'var(--good)' }} />True</button>
            </div>
          </GlassCard>
          {/* back */}
          <GlassCard level={2} className="myth-face back stack" style={{ gap: 14 }} aria-hidden={!flipped}>
            <div className="row between">
              {flipped ? <VerdictBadge v={mv.v} label={mv.label} size="lg" pulse /> : <span />}
              <button className="icon-btn" aria-label={saved.includes(key) ? 'Unsave' : 'Save'} onClick={() => toggleSaved(key)} style={saved.includes(key) ? { color: 'var(--accent)' } : undefined}>
                <Icon name={saved.includes(key) ? 'bookmarkFill' : 'bookmark'} size={18} />
              </button>
            </div>
            {guess && <p className="small" style={{ fontWeight: 700, color: right ? 'var(--good)' : 'var(--moderate)' }}>{right ? 'Good instinct.' : 'Easy one to believe — here’s the fuller picture.'}</p>}
            <div><div className="eyebrow">What’s actually true</div><p style={{ marginTop: 4 }}>{m.truth}</p></div>
            <div><div className="eyebrow">Where the myth comes from</div><p className="muted small" style={{ marginTop: 4 }}>{m.origin}</p></div>
            <div className="row"><span className="eyebrow">Evidence</span><EvidenceChip level={m.evidence} /></div>
            <GlassCard className="pad" style={{ padding: 14 }}><div className="eyebrow">What to do</div><p className="small" style={{ marginTop: 4 }}>{m.todo}</p></GlassCard>
            {onNext && <button className="btn btn-primary" onClick={() => { setFlipped(false); setGuess(null); setTimeout(() => onNext(1), 300); }}>Next claim<Icon name="arrowRight" size={18} /></button>}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default function Myths() {
  const [params] = useSearchParams();
  const start = Math.max(0, myths.findIndex((m) => m.id === params.get('card')));
  const [i, setI] = useState(start);
  const [fwd, setFwd] = useState('');
  const [result, setResult] = useState<Myth | null | undefined>(undefined);
  const [aiBy, setAiBy] = useState('');
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState('');
  const status = useAiStatus();
  const { ai, profile } = useStore();
  const check = async () => {
    setErr(''); setAiBy('');
    if (!status?.ready) { setResult(matchForward(fwd)); return; }
    setChecking(true);
    const r = await runTask<MythAIT>('myth', { text: fwd, profile: toContext(profile) }, ai);
    setChecking(false);
    if (r.ok) { setResult(toMyth(r.data)); setAiBy(r.providerLabel); }
    else if (r.emergency) { setErr('This sounds like it could be an emergency — please call 112 or get to a hospital now.'); setResult(undefined); }
    else { setErr(r.message ?? ''); setResult(matchForward(fwd)); }
  };

  useEffect(() => setI(start), [start]);

  return (
    <div className="page stack-lg">
      <BackBar title="Myth buster" />
      <div className="two-col">
        <section className="stack">
          <div className="row between">
            <h1 className="h1">True or myth?</h1>
            <span className="small faint num">{i + 1} / {myths.length}</span>
          </div>
          <MythFlipCard key={myths[i].id} m={myths[i]} onNext={() => setI((x) => (x + 1) % myths.length)} />
          <p className="small muted" style={{ textAlign: 'center' }}>No judgement — most of these were passed on with love.</p>
        </section>

        <section className="stack">
          <GlassCard className="pad-lg stack">
            <div className="row"><span className="tile-icon" style={{ '--ic': '#4ADE80' } as CSSProperties}><Icon name="message" size={20} /></span><div><h2 className="h3">Got a WhatsApp forward?</h2><p className="small muted">Paste it — we’ll check it against what the evidence says.</p></div></div>
            <label className="sr-only" htmlFor="fwd">Forward text</label>
            <textarea id="fwd" rows={4} value={fwd} onChange={(e) => setFwd(e.target.value)}
              placeholder="e.g. ‘Doctors are shocked! Drinking water with food destroys digestion…’"
              style={{ width: '100%', resize: 'vertical', border: 0, outline: 0, borderRadius: 16, padding: 14, background: 'var(--field)', boxShadow: 'inset 0 0 0 1px var(--hairline)', fontSize: 15 }} />
            <button className="btn btn-primary" disabled={!fwd.trim() || checking} onClick={check}>{checking ? 'Checking…' : 'Check this forward'}</button>
            {err && <p className="small" style={{ color: 'var(--bad)' }}>{err}</p>}
          </GlassCard>

          {result !== undefined && (result ? (
            <GlassCard level={2} className="pad-lg stack page">
              <div className="row between"><span className="eyebrow">Myth check</span><VerdictBadge v={mythVerdict[result.verdict].v} label={mythVerdict[result.verdict].label} pulse /></div>
              {aiBy ? <div><AiTag provider={aiBy} /></div> : null}
              <p className="h3">{aiBy ? `“${result.claim}”` : `Closest checked claim: “${result.claim}”`}</p>
              <p>{result.truth}</p>
              {aiBy && (
                <>
                  <div><div className="eyebrow">Where it comes from</div><p className="small muted" style={{ marginTop: 4 }}>{result.origin}</p></div>
                  <div><div className="eyebrow">What to do</div><p className="small" style={{ marginTop: 4 }}>{result.todo}</p></div>
                </>
              )}
              <div className="row between"><EvidenceChip level={result.evidence} />
                {!aiBy && <button className="small" style={{ fontWeight: 700, minHeight: 44 }} onClick={() => setI(myths.indexOf(result))}>Open full card →</button>}</div>
              {aiBy && <AiNote>Checked by AI — it can be wrong. For anything about medicines, ask your doctor.</AiNote>}
            </GlassCard>
          ) : (
            <GlassCard level={2} className="pad-lg stack page">
              <span className="eyebrow">Not in our checked list yet</span>
              <p className="h3">Three quick questions to ask any forward</p>
              <ul className="bullets">
                <li><Icon name="chevronRight" size={16} /><span>Does it name a real study or doctor you can look up? “Doctors are shocked” is not a source.</span></li>
                <li><Icon name="chevronRight" size={16} /><span>Does it promise a cure or say medicine is a scam? Big red flag.</span></li>
                <li><Icon name="chevronRight" size={16} /><span>Is it selling something at the end?</span></li>
              </ul>
            </GlassCard>
          ))}

          <div className="stack" style={{ gap: 8 }}>
            <span className="eyebrow">All claims</span>
            {myths.map((m, idx) => (
              <GlassCard as="button" key={m.id} press className="row between" style={{ padding: '12px 16px', textAlign: 'left', minHeight: 56 }} onClick={() => { setI(idx); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <span className="small" style={{ fontWeight: 650 }}>{m.claim}</span>
                <VerdictBadge v={mythVerdict[m.verdict].v} label={mythVerdict[m.verdict].label} size="sm" />
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
