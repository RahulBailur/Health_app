import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FloatingSearch } from '../components/chrome';
import { BackBar, EmergencyBanner, FrostedSkeleton, GlassCard, ProductMini, Sheet, VerdictBadge } from '../components/kit';
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
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [warn, setWarn] = useState(false);
  const emergency = isEmergency(q);
  const hits = search(q);
  const top = hits[0];
  const topProduct = top?.type === 'product' ? products.find((p) => p.id === top.id) : undefined;

  useEffect(() => {
    setLoading(true); setDismissed(false);
    setWarn(needsInteractionWarning(q));
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="page stack-lg">
      {emergency && !dismissed && <EmergencyBanner onDismiss={() => setDismissed(true)} />}
      <BackBar title="Answer" />
      <FloatingSearch initial={q} key={q} />

      {loading ? (
        <GlassCard className="pad-lg"><FrostedSkeleton lines={4} height={16} /></GlassCard>
      ) : (
        <div className="stack page">
          {mentionsBloodThinner(q) && !warn && (
            <GlassCard tint="moderate" className="ribbon"><Icon name="alert" size={20} style={{ color: 'var(--moderate)', flex: 'none' }} /><span>You mentioned a blood thinner. Check any new supplement or herbal product with your doctor first.</span></GlassCard>
          )}
          {top ? (
            <>
              <GlassCard level={2} className="pad-lg stack">
                <span className="eyebrow">Short answer</span>
                {topProduct && <VerdictBadge v={topProduct.verdict} pulse />}
                <p className="lede">{top.sub}</p>
                <Link to={hrefFor(top)} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Open the full {typeLabel[top.type].toLowerCase()}<Icon name="arrowRight" size={18} /></Link>
              </GlassCard>
              {hits.length > 1 && <span className="eyebrow" style={{ marginTop: 8 }}>Related</span>}
              {hits.slice(1).map((h) => (
                <GlassCard as={Link} key={h.type + h.id} to={hrefFor(h)} press className="pad row" style={{ alignItems: 'flex-start' }}>
                  <div className="grow"><span className="eyebrow">{typeLabel[h.type]}</span><div className="h3">{h.title}</div><p className="small muted" style={{ marginTop: 2 }}>{h.sub.slice(0, 110)}{h.sub.length > 110 ? '…' : ''}</p></div>
                  <Icon name="chevronRight" size={18} style={{ color: 'var(--text-3)', marginTop: 20 }} />
                </GlassCard>
              ))}
            </>
          ) : (
            <GlassCard className="pad-lg stack">
              <p className="h3">We haven’t written that one up yet.</p>
              <p className="muted small">This preview answers from a small checked library. Try a product, a nutrient, a myth, or a condition — or scan a label.</p>
              <div className="row wrap" style={{ gap: 8 }}>{['is ragi good for diabetes?', 'whey vs soy', 'curd at night', 'vitamin B12'].map((s) => <Link key={s} className="chip tap" to={`/ask?q=${encodeURIComponent(s)}`}>{s}</Link>)}</div>
            </GlassCard>
          )}
        </div>
      )}

      <Sheet open={warn && !loading} onClose={() => setWarn(false)} label="Possible interaction">
        <div className="stack">
          <div className="row"><span className="tile-icon" style={{ '--ic': '#FBBF24' } as CSSProperties}><Icon name="alert" size={20} /></span><h2 className="h2">This supplement may interact</h2></div>
          <p>You mentioned blood thinners. Supplements like fish oil, turmeric/curcumin, ginkgo, garlic pills, vitamin E and high-dose green tea extract can raise bleeding risk with them. Vitamin K can make some blood thinners work less well.</p>
          <GlassCard className="pad" tint="bad"><p className="small" style={{ fontWeight: 650 }}>Don’t start or stop anything without asking the doctor who prescribed your blood thinner. Get help fast for unusual bruising, black stools, or bleeding that won’t stop.</p></GlassCard>
          <button className="btn btn-primary" onClick={() => setWarn(false)}>I understand</button>
        </div>
      </Sheet>
    </div>
  );
}
