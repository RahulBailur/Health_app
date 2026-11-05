import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AiNote, AiTag, BackBar, GlassCard, VerdictBadge } from '../components/kit';
import { runTask, toComparePair, toContext, useAiStatus, type CompareAIT } from '../lib/ai';
import { useStore } from '../lib/store';
import { Icon } from '../components/Icon';
import { comparePairs } from '../data/content';
import type { ComparePair } from '../data/types';

const GOALS = ['Weight loss', 'Muscle', 'Diabetes', 'Kids', 'Budget'];

export function CompareTable({ pair }: { pair: ComparePair }) {
  return (
    <table className="cmp">
      <caption className="sr-only">{pair.a} versus {pair.b}, {pair.unit}</caption>
      <thead>
        <tr><th scope="col"><span className="sr-only">Measure</span></th><th scope="col">{pair.a}</th><th scope="col">{pair.b}</th></tr>
      </thead>
      <tbody>
        {pair.rows.map((r) => (
          <tr key={r.label}>
            <th scope="row">{r.label}</th>
            <td className={`num ${r.better === 'a' ? 'win' : ''}`}><span>{r.a}</span></td>
            <td className={`num ${r.better === 'b' ? 'win' : ''}`}><span>{r.b}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Compare() {
  const [params, setParams] = useSearchParams();
  const [aiPair, setAiPair] = useState<{ pair: ComparePair; by: string } | null>(null);
  const pair = aiPair?.pair ?? comparePairs.find((p) => p.id === params.get('pair')) ?? comparePairs[0];
  const [goal, setGoal] = useState('Muscle');
  const status = useAiStatus();
  const { ai, profile } = useStore();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const compareAnything = async (e: FormEvent) => {
    e.preventDefault();
    if (!a.trim() || !b.trim()) return;
    setBusy(true); setErr('');
    const r = await runTask<CompareAIT>('compare', { a: a.trim(), b: b.trim(), profile: toContext(profile) }, ai);
    setBusy(false);
    if (r.ok) setAiPair({ pair: toComparePair(r.data), by: r.providerLabel });
    else setErr(r.message ?? 'Couldn’t compare those right now.');
  };
  const pick = pair.picks[goal];
  const tie = pick.pick === 'tie';

  return (
    <div className="page stack-lg">
      <BackBar title="Compare" />
      <div className="row wrap" style={{ gap: 8 }}>
        {comparePairs.map((p) => (
          <button key={p.id} className="chip tap" aria-pressed={p.id === pair.id} onClick={() => { setAiPair(null); setParams({ pair: p.id }); }}>{p.a} vs {p.b}</button>
        ))}
      </div>

      {status?.ready && (
        <GlassCard as="form" className="pad stack" onSubmit={compareAnything} style={{ gap: 10 }}>
          <span className="eyebrow">Compare anything</span>
          <div className="row" style={{ gap: 8 }}>
            <input value={a} onChange={(e) => setA(e.target.value)} placeholder="e.g. poha" aria-label="First food" className="chip tap grow" style={{ border: 0, outline: 0, minWidth: 0 }} maxLength={120} />
            <span className="faint small">vs</span>
            <input value={b} onChange={(e) => setB(e.target.value)} placeholder="e.g. upma" aria-label="Second food" className="chip tap grow" style={{ border: 0, outline: 0, minWidth: 0 }} maxLength={120} />
          </div>
          <button className="btn btn-primary" disabled={busy || !a.trim() || !b.trim()}>{busy ? 'Comparing…' : 'Compare'}</button>
          {err && <p className="small" style={{ color: 'var(--bad)' }}>{err}</p>}
        </GlassCard>
      )}
      {aiPair && <div className="row between"><AiTag provider={aiPair.by} /><span className="illus">estimates</span></div>}

      <div className="two-col">
        <div className="stack">
          <div className="row" style={{ gap: 10, alignItems: 'stretch' }}>
            {[pair.a, pair.b].map((n, i) => (
              <GlassCard key={n} level={2} className="pad grow stack" style={{ gap: 4, textAlign: 'center' }}>
                <span className="eyebrow">{i === 0 ? 'A' : 'B'}</span>
                <span className="h3">{n}</span>
              </GlassCard>
            ))}
          </div>
          <GlassCard className="pad">
            <CompareTable pair={pair} />
            <p className="tiny faint" style={{ marginTop: 10 }}>{pair.unit} · glowing value is the better one · illustrative</p>
          </GlassCard>
        </div>

        <div className="stack">
          <span className="eyebrow">Which to pick — for your goal</span>
          <div className="seg-ctl" role="group" aria-label="Goal">
            {GOALS.map((g) => <button key={g} aria-pressed={goal === g} onClick={() => setGoal(g)}>{g}</button>)}
          </div>
          <GlassCard level={2} tint={tie ? 'moderate' : 'good'} className="pad-lg stack page" key={pair.id + goal}>
            <div className="row between">
              <span className="eyebrow">{goal}</span>
              {tie ? <VerdictBadge v="moderate" label="Honest tie" pulse /> : <VerdictBadge v="good" label="Pick" pulse />}
            </div>
            <p className="h1" style={{ fontSize: 26 }}>{tie ? 'Either is fine' : pick.pick === 'a' ? pair.a : pair.b}</p>
            <p>{pick.why}</p>
          </GlassCard>
          <GlassCard className="pad row" style={{ alignItems: 'flex-start' }}>
            <Icon name="bulb" size={20} style={{ color: 'var(--turmeric)', flex: 'none' }} />
            <p className="small muted">Swaps only help if you actually enjoy the new food. The best choice is the one you’ll keep eating.</p>
          </GlassCard>
          {aiPair && <AiNote />}
        </div>
      </div>
    </div>
  );
}
