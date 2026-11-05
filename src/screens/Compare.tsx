import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BackBar, GlassCard, VerdictBadge } from '../components/kit';
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
  const pair = comparePairs.find((p) => p.id === params.get('pair')) ?? comparePairs[0];
  const [goal, setGoal] = useState('Muscle');
  const pick = pair.picks[goal];
  const tie = pick.pick === 'tie';

  return (
    <div className="page stack-lg">
      <BackBar title="Compare" />
      <div className="row wrap" style={{ gap: 8 }}>
        {comparePairs.map((p) => (
          <button key={p.id} className="chip tap" aria-pressed={p.id === pair.id} onClick={() => setParams({ pair: p.id })}>{p.a} vs {p.b}</button>
        ))}
      </div>

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
        </div>
      </div>
    </div>
  );
}
