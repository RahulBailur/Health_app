import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BackBar, GlassCard, ProductThumb, VerdictBadge, verdictLabel } from '../components/kit';
import { Icon } from '../components/Icon';
import { productById } from '../data/products';
import { myths } from '../data/content';
import type { Verdict } from '../data/types';
import { useStore } from '../lib/store';

const mv: Record<string, Verdict> = { true: 'good', partly: 'moderate', myth: 'bad' };

export function Saved() {
  const { saved, toggleSaved } = useStore();
  const [filter, setFilter] = useState<Verdict | 'all'>('all');
  const items = saved.map((k) => {
    const [type, id] = k.split(':');
    if (type === 'product') { const p = productById(id); return p && { k, type, v: p.split ? 'moderate' as Verdict : p.verdict, p }; }
    const m = myths.find((x) => x.id === id); return m && { k, type, v: mv[m.verdict], m };
  }).filter(Boolean) as { k: string; type: string; v: Verdict; p?: ReturnType<typeof productById>; m?: (typeof myths)[number] }[];
  const shown = items.filter((i) => filter === 'all' || i.v === filter);

  return (
    <div className="page stack-lg">
      <div className="row between"><h1 className="h1">Saved</h1><span className="small faint num">{items.length} items</span></div>
      <div className="row wrap" style={{ gap: 8 }} role="group" aria-label="Filter by verdict">
        <button className="chip tap" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All</button>
        {(['good', 'moderate', 'bad'] as Verdict[]).map((v) => (
          <button key={v} className="chip tap" aria-pressed={filter === v} onClick={() => setFilter(v)}>
            <span className="dot" style={{ background: `var(--${v})` }} />{verdictLabel[v]}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <GlassCard className="pad-lg stack" style={{ textAlign: 'center', alignItems: 'center' }}>
          <Icon name="bookmark" size={30} style={{ color: 'var(--text-3)' }} />
          <p className="muted">Nothing here yet. Tap the bookmark on any verdict to keep it.</p>
        </GlassCard>
      ) : (
        <div className="masonry">
          {shown.map((i) => i.p ? (
            <GlassCard as={Link} key={i.k} to={`/product/${i.p.id}`} press className="pad stack" style={{ gap: 10, display: 'flex', padding: 12 }}>
              <ProductThumb p={i.p} />
              <span className="h3" style={{ fontSize: 15 }}>{i.p.name}</span>
              <span className="tiny muted">{i.p.oneLine}</span>
              <VerdictBadge v={i.v} size="sm" label={i.p.split ? 'Split' : undefined} />
            </GlassCard>
          ) : (
            <GlassCard key={i.k} className="pad stack" style={{ gap: 10, display: 'flex' }}>
              <span className="eyebrow">Myth check</span>
              <Link to={`/myths?card=${i.m!.id}`} className="h3" style={{ fontSize: 15 }}>“{i.m!.claim}”</Link>
              <div className="row between"><VerdictBadge v={i.v} size="sm" label={i.m!.verdict === 'myth' ? 'Myth' : i.m!.verdict === 'partly' ? 'Partly' : 'True'} />
                <button className="icon-btn" style={{ width: 36, height: 36 }} aria-label="Remove" onClick={() => toggleSaved(i.k)}><Icon name="trash" size={16} /></button></div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

const DIETS = ['Vegetarian', 'Non-vegetarian', 'Vegan', 'Jain', 'Eggetarian'];
const COND = ['Prediabetes', 'Diabetes', 'BP', 'Cholesterol', 'Thyroid', 'PCOS', 'Pregnancy'];

export function Profile() {
  const { profile, setProfile, theme, setTheme } = useStore();
  const [newAllergy, setNewAllergy] = useState('');
  const set = (patch: Partial<typeof profile>) => setProfile({ ...profile, ...patch });

  return (
    <div className="page stack-lg" style={{ maxWidth: 720 }}>
      <BackBar title="Profile" />
      <GlassCard level={2} className="pad-lg row" style={{ gap: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: 20, display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 800, color: '#052e2b', background: 'linear-gradient(150deg, #ECFCCB, #A3E635 50%, #10B981)', boxShadow: '0 10px 30px rgba(16,185,129,.4), inset 0 1px 0 rgba(255,255,255,.8)' }}>
          {profile.name.charAt(0)}
        </div>
        <div className="grow">
          <label className="sr-only" htmlFor="name">Name</label>
          <input id="name" value={profile.name} onChange={(e) => set({ name: e.target.value })} className="h2" style={{ background: 'transparent', border: 0, outline: 0, width: '100%', fontWeight: 800 }} />
          <p className="small muted">{profile.diet} · {profile.country}</p>
        </div>
      </GlassCard>

      <GlassCard tint="bad" className="pad-lg stack">
        <div className="row between"><div className="row"><Icon name="pin" size={18} style={{ color: 'var(--bad)' }} /><h2 className="h3">Allergies</h2></div><span className="tiny" style={{ color: 'var(--bad)', fontWeight: 700 }}>Always override advice</span></div>
        <div className="row wrap" style={{ gap: 8 }}>
          {profile.allergies.map((a) => (
            <button key={a} className="chip danger tap" aria-label={`Remove ${a}`} onClick={() => set({ allergies: profile.allergies.filter((x) => x !== a) })}>
              <Icon name="pin" size={14} />{a}<Icon name="close" size={14} />
            </button>
          ))}
          <form className="row" style={{ gap: 6 }} onSubmit={(e) => { e.preventDefault(); const v = newAllergy.trim(); if (v && !profile.allergies.includes(v)) set({ allergies: [...profile.allergies, v] }); setNewAllergy(''); }}>
            <label className="sr-only" htmlFor="allergy">Add allergy</label>
            <input id="allergy" value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} placeholder="Add (e.g. milk)" className="chip tap" style={{ width: 150, outline: 0, border: 0 }} />
            <button className="icon-btn" aria-label="Add allergy"><Icon name="plus" size={18} /></button>
          </form>
        </div>
      </GlassCard>

      <GlassCard className="pad-lg stack">
        <h2 className="h3">Diet type</h2>
        <div className="row wrap" style={{ gap: 8 }}>{DIETS.map((d) => <button key={d} className="chip tap" aria-pressed={profile.diet === d} onClick={() => set({ diet: d })}>{d}</button>)}</div>
        <div className="divider" />
        <h2 className="h3">Conditions</h2>
        <div className="row wrap" style={{ gap: 8 }}>{COND.map((d) => <button key={d} className="chip tap" aria-pressed={profile.conditions.includes(d)} onClick={() => set({ conditions: profile.conditions.includes(d) ? profile.conditions.filter((c) => c !== d) : [...profile.conditions, d] })}>{d}</button>)}</div>
      </GlassCard>

      <GlassCard className="pad-lg stack">
        <div className="row between"><span className="row"><Icon name="globe" size={19} /><span style={{ fontWeight: 650 }}>Country</span></span>
          <select value={profile.country} onChange={(e) => set({ country: e.target.value })} className="chip tap" style={{ border: 0, outline: 0 }}>
            {['India', 'UAE', 'UK', 'USA', 'Singapore'].map((c) => <option key={c}>{c}</option>)}
          </select></div>
        <div className="divider" />
        <div className="row between"><span className="row"><Icon name="ruler" size={19} /><span style={{ fontWeight: 650 }}>Units</span></span>
          <div className="seg-ctl"><button aria-pressed={profile.units === 'household'} onClick={() => set({ units: 'household' })}>Katori / tsp</button><button aria-pressed={profile.units === 'metric'} onClick={() => set({ units: 'metric' })}>Grams</button></div></div>
        <div className="divider" />
        <div className="row between"><span className="row"><Icon name={theme === 'dark' ? 'moon' : 'sun'} size={19} /><span style={{ fontWeight: 650 }}>Theme</span></span>
          <div className="seg-ctl"><button aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>Dark glass</button><button aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>Frosted morning</button></div></div>
        <p className="tiny faint">Animations follow your phone’s “reduce motion” setting.</p>
      </GlassCard>
      <Link to="/kit" className="small muted" style={{ textAlign: 'center', minHeight: 44 }}>View the component kit →</Link>
    </div>
  );
}
