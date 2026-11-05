import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AiNote, AiTag, AlternativeCard, BackBar, Collapsible, FrostedSkeleton, GlassCard, ProductThumb, ProsConsPanel, ProteinTranslator,
  SaltRing, ScorecardRow, SplitVerdict, SugarTranslator, VerdictBadge,
} from '../components/kit';
import { Icon } from '../components/Icon';
import { productById } from '../data/products';
import { useStore } from '../lib/store';

export default function Verdict() {
  const { id = '' } = useParams();
  const { saved, toggleSaved, profile, aiProducts } = useStore();
  const p = productById(id) ?? aiProducts[id];
  const [per100, setPer100] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 550); window.scrollTo(0, 0); return () => clearTimeout(t); }, [id]);

  if (!p) return <div className="page stack"><BackBar /><GlassCard className="pad-lg">We haven’t checked this product yet. <Link to="/scan">Scan its label</Link> instead.</GlassCard></div>;

  const key = `product:${p.id}`;
  const isSaved = saved.includes(key);
  const n = per100 ? p.per100 : p.perServing;
  const safetyBad = p.scorecard.some((s) => s.key === 'safety' && s.verdict === 'bad');
  const allergyHits = profile.allergies.filter((a) => p.allergens.some((x) => a.toLowerCase().includes(x) || x.includes(a.toLowerCase())));
  const maxRupees = Math.max(...p.value.items.map((i) => i.rupees), 1);

  const share = async () => {
    const data = { title: `${p.name} — Ahaara verdict`, text: p.oneLine, url: location.href };
    try { if (navigator.share) await navigator.share(data); else await navigator.clipboard.writeText(location.href); } catch { /* dismissed */ }
  };

  if (loading) {
    return (
      <div className="page stack">
        <BackBar title="Verdict" />
        <GlassCard className="pad-lg stack"><div className="skel" style={{ height: 180, borderRadius: 18 }} /><FrostedSkeleton lines={3} height={16} /></GlassCard>
        <GlassCard className="pad-lg"><FrostedSkeleton lines={4} /></GlassCard>
      </div>
    );
  }

  return (
    <div className="page stack-lg">
      <BackBar
        title="Verdict"
        right={<>
          <button className="icon-btn" aria-label="Share" onClick={share}><Icon name="share" size={19} /></button>
          <button className="icon-btn" aria-pressed={isSaved} aria-label={isSaved ? 'Remove from saved' : 'Save'} onClick={() => toggleSaved(key)}
            style={isSaved ? { color: 'var(--accent)' } : undefined}>
            <Icon name={isSaved ? 'bookmarkFill' : 'bookmark'} size={19} />
          </button>
        </>}
      />

      {allergyHits.length > 0 && (
        <GlassCard level={2} tint="bad" className="ribbon" role="alert">
          <Icon name="alert" size={20} style={{ color: 'var(--bad)', flex: 'none' }} />
          <span>Contains {p.allergens.join(', ')} — you listed a {allergyHits.join(', ').toLowerCase()} allergy. Your allergy overrides this verdict: skip it.</span>
        </GlassCard>
      )}

      <div className="two-col">
        {/* ---------------- left column: identity + numbers ---------------- */}
        <div className="stack-lg">
          <section className="stack stagger" style={{ gap: 18 }}>
            <div style={{ position: 'relative', display: 'grid', placeItems: 'center', paddingTop: 6 }}>
              <div aria-hidden style={{ position: 'absolute', width: 210, height: 210, borderRadius: '50%', background: `radial-gradient(circle, ${p.palette[0]}66, transparent 70%)`, filter: 'blur(10px)' }} />
              <ProductThumb p={p} height={196} />
            </div>
            <div className="stack" style={{ gap: 6, textAlign: 'center', alignItems: 'center' }}>
              {p.ai && <AiTag provider={p.ai.provider} confidence={p.ai.confidence} />}
              <span className="eyebrow">{p.category} · {p.pack}</span>
              <h1 className="h1">{p.name}</h1>
              <p className="small muted">{p.variant}</p>
            </div>
            <GlassCard level={2} className="pad-lg">
              {p.split ? (
                <div className="stack" style={{ gap: 14 }}>
                  <div className="row between"><span className="eyebrow">Split verdict</span><span className="eyebrow">depends on who</span></div>
                  <SplitVerdict items={p.split} />
                </div>
              ) : (
                <div className="row between">
                  <span className="eyebrow">Our verdict</span>
                  <VerdictBadge v={p.verdict} size="lg" pulse delay={250} />
                </div>
              )}
            </GlassCard>
          </section>

          {safetyBad && p.safetyNote && (
            <GlassCard level={2} tint="bad" className="ribbon" role="note">
              <Icon name="shield" size={20} style={{ color: 'var(--bad)', flex: 'none' }} />
              <span>{p.safetyNote}</span>
            </GlassCard>
          )}

          <section className="stack" style={{ gap: 10, borderLeft: '3px solid var(--accent)', paddingLeft: 16 }}>
            <span className="eyebrow">In one line</span>
            <p className="lede" style={{ fontSize: 23 }}>{p.oneLine}</p>
          </section>

          <GlassCard className="pad-lg">
            <div className="row between wrap" style={{ gap: 12 }}>
              <h2 className="h2">The label, <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>translated</em></h2>
              <div className="seg-ctl" role="group" aria-label="Basis">
                <button aria-pressed={!per100} onClick={() => setPer100(false)}>Per {p.serving.split(' (')[0]}</button>
                <button aria-pressed={per100} onClick={() => setPer100(true)}>100 g</button>
              </div>
            </div>
            <div className="rule-thick" />
            <div key={String(per100)}>
              <div className="label-row">
                <div><div className="eyebrow">Sugar</div><div className="big">{n.sugar}<small>g</small></div></div>
                <SugarTranslator grams={n.sugar} />
              </div>
              <div className="label-row">
                <div><div className="eyebrow">Protein</div><div className="big">{n.protein}<small>g</small></div></div>
                <ProteinTranslator grams={n.protein} />
              </div>
              <div className="label-row">
                <div><div className="eyebrow">Salt</div><div className="big">{n.salt}<small>g</small></div></div>
                <SaltRing grams={n.salt} />
              </div>
            </div>
            <div className="rule-thick" style={{ height: 3 }} />
            <div className="row between tiny faint" style={{ fontFamily: 'var(--mono)', marginTop: 8 }}>
              <span>{n.kcal} kcal · {n.fibre} g fibre</span><span>illustrative</span>
            </div>
          </GlassCard>
        </div>

        {/* ---------------- right column: judgement ----------------------- */}
        <div className="stack-lg">
          <ProsConsPanel good={p.good} bad={p.bad} />

          <GlassCard className="pad-lg">
            <div className="row between" style={{ marginBottom: 6 }}>
              <h2 className="h2">Inspection report</h2>
              <span className="eyebrow">tap a row</span>
            </div>
            <ul>{p.scorecard.map((s, i) => <ScorecardRow key={s.key} item={s} index={i} />)}</ul>
          </GlassCard>

          {(p.goodFor.length > 0 || p.skipIf.length > 0) && (
            <section className="stack" style={{ gap: 12 }}>
              {p.goodFor.length > 0 && (
                <div className="stack" style={{ gap: 8 }}>
                  <span className="eyebrow">Good for</span>
                  <div className="row wrap" style={{ gap: 8 }}>{p.goodFor.map((g) => <span key={g} className="chip"><span className="dot" style={{ background: 'var(--good)' }} />{g}</span>)}</div>
                </div>
              )}
              <div className="stack" style={{ gap: 8 }}>
                <span className="eyebrow">Skip if</span>
                <div className="row wrap" style={{ gap: 8 }}>{p.skipIf.map((g) => <span key={g} className="chip"><span className="dot" style={{ background: 'var(--bad)' }} />{g}</span>)}</div>
              </div>
            </section>
          )}

          <section className="stack">
            <div className="sec-head"><h2 className="eyebrow">Better or cheaper</h2></div>
            <div className="carousel">{p.alternatives.map((a) => <AlternativeCard key={a.name} alt={a} />)}</div>
          </section>

          <GlassCard className="pad-lg stack">
            <div className="row between"><h2 className="h2">What you pay</h2><span className="tiny faint">{p.value.metric}</span></div>
            <div className="stack" style={{ gap: 12 }}>
              {p.value.items.map((it, i) => (
                <div key={it.label}>
                  <div className="row between small" style={{ marginBottom: 6 }}>
                    <span style={{ fontWeight: it.highlight ? 800 : 600 }}>{it.label}</span>
                    <span className="num" style={{ fontWeight: 800 }}>₹{it.rupees}</span>
                  </div>
                  <div className="bar"><i style={{
                    width: `${Math.max(3, (it.rupees / maxRupees) * 100)}%`, animationDelay: `${i * 90}ms`,
                    background: it.highlight ? 'var(--turmeric)' : 'var(--text-3)',
                  }} /></div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard level={2} className="pad-lg stack" style={{ gap: 10 }}>
            <span className="eyebrow">Bottom line</span>
            <p className="lede" style={{ fontSize: 22 }}>{p.bottomLine}</p>
            <p className="small muted row" style={{ alignItems: 'flex-start', gap: 8 }}>
              <Icon name="info" size={16} style={{ flex: 'none', marginTop: 3 }} />
              Based on the current label. Recipes change — check these 3 numbers on your pack: sugar, protein, and the first ingredient.
            </p>
            {p.ai && <AiNote />}
          </GlassCard>

          <GlassCard className={`pad ${sourcesOpen ? 'open' : ''}`}>
            <button className="row between" style={{ width: '100%', minHeight: 44 }} aria-expanded={sourcesOpen} onClick={() => setSourcesOpen(!sourcesOpen)}>
              <span className="row"><Icon name="book" size={19} /><span className="h3">Sources</span></span>
              <Icon name="chevronDown" size={18} className="chev" style={{ transform: sourcesOpen ? 'rotate(180deg)' : undefined }} />
            </button>
            <Collapsible open={sourcesOpen}>
              <ul className="bullets" style={{ paddingTop: 10 }}>
                {p.sources.map((s) => <li key={s}><Icon name="chevronRight" size={14} style={{ color: 'var(--text-3)' }} /><span className="small muted">{s}</span></li>)}
              </ul>
              <p className="tiny faint" style={{ marginTop: 10 }}>Ingredients (label): {p.ingredients}</p>
            </Collapsible>
          </GlassCard>

          <p className="small muted" style={{ textAlign: 'center' }}>Does that make sense, or should I explain it differently? <Link to={`/ask?q=${encodeURIComponent(p.name)}`} style={{ fontWeight: 700, color: 'var(--text)' }}>Ask a follow-up</Link></p>
        </div>
      </div>
    </div>
  );
}
