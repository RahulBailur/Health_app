import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FloatingSearch } from '../components/chrome';
import {
  AiNote, AiTag, BackBar, EmergencyBanner, ExplainAgainLadder, FrostedSkeleton, GlassCard, ProductMini, Sheet, VerdictBadge,
} from '../components/kit';
import { runTask, streamAsk, toContext, toProduct, useAiStatus, type ExplainAIT, type ProductAIT } from '../lib/ai';
import { useStore } from '../lib/store';
import { Icon } from '../components/Icon';
import { articles, conditions, myths } from '../data/content';
import { products } from '../data/products';
import { hrefFor, isEmergency, mentionsBloodThinner, needsInteractionWarning, search, type Hit } from '../lib/ask';

export function Explore() {
  return (
    <div className="page stack-lg">
      <div className="stack" style={{ gap: 6 }}><h1 className="h1">Explore</h1><p className="muted">The encyclopedia — concepts, products, myths and conditions.</p></div>
      <FloatingSearch />
      <section className="stack">
        <h2 className="eyebrow">Concepts, explained simply</h2>
        <div className="tiles">
          {articles.map((a) => (
            <GlassCard as={Link} key={a.id} to={`/article/${a.id}`} press className="tile" style={{ minHeight: 150 }}>
              <span className="tile-icon" style={{ '--ic': '#C4B5FD' } as CSSProperties}><Icon name={a.icon} size={20} /></span>
              <span><span className="t" style={{ display: 'block' }}>{a.title}</span><span className="s" style={{ display: 'block' }}>{a.oneLine.slice(0, 64)}…</span></span>
            </GlassCard>
          ))}
        </div>
      </section>
      <section className="stack">
        <h2 className="eyebrow">Product verdicts</h2>
        <div className="carousel">{products.map((p) => <ProductMini key={p.id} p={p} />)}</div>
      </section>
      <section className="stack">
        <h2 className="eyebrow">Conditions</h2>
        <div className="row wrap" style={{ gap: 8 }}>{conditions.map((c) => <Link key={c.id} to={`/conditions/${c.id}`} className="chip tap">{c.name}</Link>)}</div>
      </section>
      <section className="stack">
        <h2 className="eyebrow">Myths, checked</h2>
        <div className="row wrap" style={{ gap: 8 }}>{myths.map((m) => <Link key={m.id} to={`/myths?card=${m.id}`} className="chip tap">{m.claim}</Link>)}</div>
      </section>
    </div>
  );
}

const typeLabel: Record<Hit['type'], string> = { product: 'Verdict', myth: 'Myth check', article: 'Explained', condition: 'Condition', compare: 'Compare' };

export function Ask() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const nav = useNavigate();
  const { profile, ai, addAiProduct } = useStore();
  const status = useAiStatus();
  const [dismissed, setDismissed] = useState(false);
  const [warn, setWarn] = useState(false);
  const [answer, setAnswer] = useState<{ text: string; provider: string; state: 'idle' | 'streaming' | 'done' | 'error'; error?: string }>({ text: '', provider: '', state: 'idle' });
  const [busy, setBusy] = useState<'' | 'verdict' | 'explain'>('');
  const [explain, setExplain] = useState<ExplainAIT | null>(null);
  const [step, setStep] = useState(1);
  const abort = useRef<AbortController | null>(null);
  const emergency = isEmergency(q);
  const hits = search(q);
  const top = hits[0];
  const topProduct = top?.type === 'product' ? products.find((p) => p.id === top.id) : undefined;

  useEffect(() => {
    setDismissed(false);
    setWarn(needsInteractionWarning(q));
    setExplain(null);
    setAnswer({ text: '', provider: '', state: 'idle' });
    if (!q || emergency || !status?.ready) return;
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setAnswer({ text: '', provider: '', state: 'streaming' });
    streamAsk(q, toContext(profile), ai, (t) => setAnswer((a) => ({ ...a, text: t })), ctrl.signal).then((r) => {
      if (ctrl.signal.aborted) return;
      if (r.ok) setAnswer((a) => ({ ...a, provider: r.provider, state: 'done' }));
      else setAnswer((a) => ({ ...a, state: 'error', error: r.message }));
    }).catch(() => undefined);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status?.ready]);

  const fullVerdict = async () => {
    setBusy('verdict');
    const r = await runTask<ProductAIT>('verdict', { text: q, profile: toContext(profile) }, ai);
    setBusy('');
    if (r.ok) { const p = toProduct(r.data, r.providerLabel); addAiProduct(p); nav(`/product/${p.id}`); }
    else setAnswer((a) => ({ ...a, state: 'error', error: r.message }));
  };
  const explainAgain = async () => {
    setBusy('explain');
    const r = await runTask<ExplainAIT>('explain', { text: `${q}\n\nPrevious answer: ${answer.text}` }, ai);
    setBusy('');
    if (r.ok) { setStep(1); setExplain(r.data); }
  };

  const libraryLoading = status === null;

  return (
    <div className="page stack-lg">
      {emergency && !dismissed && <EmergencyBanner onDismiss={() => setDismissed(true)} />}
      <BackBar title="Answer" />
      <FloatingSearch initial={q} key={q} />

      {mentionsBloodThinner(q) && !warn && (
        <GlassCard tint="moderate" className="ribbon"><Icon name="alert" size={20} style={{ color: 'var(--moderate)', flex: 'none' }} /><span>You mentioned a blood thinner. Check any new supplement or herbal product with your doctor first.</span></GlassCard>
      )}

      {!emergency && answer.state !== 'idle' && (
        <GlassCard level={2} className="pad-lg stack page">
          <div className="row between"><span className="eyebrow">Short answer</span>{answer.provider && <AiTag provider={answer.provider} />}</div>
          {answer.text ? (
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{answer.text}{answer.state === 'streaming' && <span className="caret" aria-hidden>▍</span>}</p>
          ) : answer.state === 'streaming' ? <FrostedSkeleton lines={4} height={14} /> : null}
          {answer.state === 'error' && <p className="small" style={{ color: 'var(--bad)' }}>{answer.error ?? 'The AI couldn’t answer right now.'}</p>}
          {answer.state === 'done' && (
            <>
              <div className="row wrap" style={{ gap: 8 }}>
                <button className="btn btn-primary" onClick={fullVerdict} disabled={!!busy}>
                  {busy === 'verdict' ? 'Writing the verdict…' : <>Full verdict<Icon name="arrowRight" size={18} /></>}
                </button>
                <button className="btn btn-ghost" onClick={explainAgain} disabled={!!busy}><Icon name="ladder" size={17} />{busy === 'explain' ? 'Thinking…' : 'Explain it differently'}</button>
              </div>
              <AiNote />
            </>
          )}
        </GlassCard>
      )}

      {libraryLoading ? (
        <GlassCard className="pad-lg"><FrostedSkeleton lines={3} height={14} /></GlassCard>
      ) : (
        <div className="stack page">
          {top ? (
            <>
              {answer.state === 'idle' ? (
                <GlassCard level={2} className="pad-lg stack">
                  <span className="eyebrow">Short answer</span>
                  {topProduct && <VerdictBadge v={topProduct.verdict} pulse />}
                  <p className="lede">{top.sub}</p>
                  <Link to={hrefFor(top)} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Open the full {typeLabel[top.type].toLowerCase()}<Icon name="arrowRight" size={18} /></Link>
                </GlassCard>
              ) : <span className="eyebrow" style={{ marginTop: 8 }}>From the Ahaara library</span>}
              {(answer.state === 'idle' ? hits.slice(1) : hits).map((h) => (
                <GlassCard as={Link} key={h.type + h.id} to={hrefFor(h)} press className="pad row" style={{ alignItems: 'flex-start' }}>
                  <div className="grow"><span className="eyebrow">{typeLabel[h.type]}</span><div className="h3">{h.title}</div><p className="small muted" style={{ marginTop: 2 }}>{h.sub.slice(0, 110)}{h.sub.length > 110 ? '…' : ''}</p></div>
                  <Icon name="chevronRight" size={18} style={{ color: 'var(--text-3)', marginTop: 20 }} />
                </GlassCard>
              ))}
            </>
          ) : answer.state === 'idle' && !emergency ? (
            <GlassCard className="pad-lg stack">
              <p className="h3">We haven’t written that one up yet.</p>
              <p className="muted small">{status?.ready ? 'Try asking in a different way.' : 'The built-in library is small. Add an AI key (see README) to answer anything — or try one of these.'}</p>
              <div className="row wrap" style={{ gap: 8 }}>{['is ragi good for diabetes?', 'whey vs soy', 'curd at night', 'vitamin B12'].map((s) => <Link key={s} className="chip tap" to={`/ask?q=${encodeURIComponent(s)}`}>{s}</Link>)}</div>
            </GlassCard>
          ) : null}
        </div>
      )}

      <Sheet open={warn} onClose={() => setWarn(false)} label="Possible interaction">
        <div className="stack">
          <div className="row"><span className="tile-icon" style={{ '--ic': '#FBBF24' } as CSSProperties}><Icon name="alert" size={20} /></span><h2 className="h2">This supplement may interact</h2></div>
          <p>You mentioned blood thinners. Supplements like fish oil, turmeric/curcumin, ginkgo, garlic pills, vitamin E and high-dose green tea extract can raise bleeding risk with them. Vitamin K can make some blood thinners work less well.</p>
          <GlassCard className="pad" tint="bad"><p className="small" style={{ fontWeight: 650 }}>Don’t start or stop anything without asking the doctor who prescribed your blood thinner. Get help fast for unusual bruising, black stools, or bleeding that won’t stop.</p></GlassCard>
          <button className="btn btn-primary" onClick={() => setWarn(false)}>I understand</button>
        </div>
      </Sheet>

      <Sheet open={!!explain} onClose={() => setExplain(null)} label="Explain it differently">
        {explain && (
          <div className="stack-lg">
            <div className="row between"><span className="eyebrow">Explain it differently</span>{answer.provider && <AiTag provider={answer.provider} />}</div>
            <ExplainAgainLadder steps={explain.steps} step={Math.min(step, explain.steps.length - 1)} onStep={setStep} />
            <div className="row">
              <button className="btn btn-ghost grow" onClick={() => setExplain(null)}>Got it</button>
              {step < explain.steps.length - 1 && <button className="btn btn-primary grow" onClick={() => setStep(step + 1)}>Still unclear<Icon name="arrowRight" size={18} /></button>}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
