import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BackBar, Disclaimer, EvidenceChip, GlassCard, RangeBar } from '../components/kit';
import { Icon } from '../components/Icon';
import { conditions } from '../data/content';

export function ConditionPicker() {
  return (
    <div className="page stack-lg">
      <BackBar title="My condition" />
      <div className="stack" style={{ gap: 6 }}>
        <h1 className="h1">What are you managing?</h1>
        <p className="muted">Pick one — we’ll explain it simply and show what actually helps.</p>
      </div>
      <div className="tiles stagger">
        {conditions.map((c) => (
          <GlassCard as={Link} key={c.id} to={`/conditions/${c.id}`} press className="row" style={{ padding: '14px 16px', minHeight: 64 }}>
            <Icon name={c.icon} size={20} style={{ color: 'var(--accent)', flex: 'none' }} />
            <span className="grow" style={{ fontWeight: 700 }}>{c.name}</span>
            <Icon name="chevronRight" size={16} style={{ color: 'var(--text-3)' }} />
          </GlassCard>
        ))}
      </div>
      <Disclaimer />
    </div>
  );
}

export default function ConditionPage() {
  const { id = '' } = useParams();
  const c = conditions.find((x) => x.id === id);
  const [value, setValue] = useState<number | null>(null);
  if (!c) return <div className="page stack"><BackBar to="/conditions" /><GlassCard className="pad-lg">Not found.</GlassCard></div>;
  const v = value ?? c.range?.sample ?? 0;

  return (
    <div className="page stack-lg">
      <BackBar title="My condition" to="/conditions" />
      <GlassCard className="ribbon" style={{ padding: '10px 14px' }}><Disclaimer /></GlassCard>
      <header className="stack" style={{ gap: 8 }}>
        <h1 className="h-display">{c.name}</h1>
        <p className="lede" style={{ fontSize: 17 }}>{c.plain}</p>
      </header>

      <div className="two-col">
        <div className="stack-lg">
          {c.range && (
            <GlassCard className="pad-lg stack">
              <div className="row between"><h2 className="h3">What your numbers mean</h2><span className="tiny faint">{c.range.label}</span></div>
              <RangeBar {...c.range} value={v} onChange={setValue} label={`Your ${c.range.label}`} />
              <p className="tiny faint row" style={{ gap: 6 }}><Icon name="arrowRight" size={13} />Drag the lens to try your own number</p>
            </GlassCard>
          )}
          <GlassCard className="pad-lg stack">
            <h2 className="h3">Food & lifestyle that help</h2>
            <ul className="stack" style={{ gap: 12 }}>
              {c.helps.map((h) => (
                <li key={h.text} className="row between" style={{ alignItems: 'flex-start' }}>
                  <span className="row" style={{ alignItems: 'flex-start', gap: 8 }}><Icon name="check" size={18} stroke={2.4} style={{ color: 'var(--good)', flex: 'none', marginTop: 2 }} /><span>{h.text}</span></span>
                  <EvidenceChip level={h.ev} />
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
        <div className="stack-lg">
          <GlassCard className="pad-lg stack" tint="moderate">
            <h2 className="h3">What to limit</h2>
            <ul className="bullets">{c.limit.map((l) => <li key={l}><Icon name="alert" size={16} style={{ color: 'var(--moderate)' }} /><span>{l}</span></li>)}</ul>
          </GlassCard>
          <GlassCard level={2} tint="bad" className="pad-lg stack">
            <div className="row"><span className="tile-icon" style={{ ['--ic' as string]: '#F87171' }}><Icon name="phone" size={20} /></span><h2 className="h2">When to see a doctor</h2></div>
            <ul className="bullets">{c.doctor.map((d) => <li key={d}><Icon name="chevronRight" size={16} style={{ color: 'var(--bad)' }} /><span style={{ fontWeight: 600 }}>{d}</span></li>)}</ul>
          </GlassCard>
          <Link to="/meal-plan" className="btn btn-ghost">Build a meal plan for {c.name.toLowerCase()}<Icon name="arrowRight" size={18} /></Link>
        </div>
      </div>
    </div>
  );
}
