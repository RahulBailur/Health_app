import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BackBar, GlassCard, ProductThumb, VerdictBadge, verdictLabel } from '../components/kit';
import { Icon } from '../components/Icon';
import { productById } from '../data/products';
import { myths } from '../data/content';
import type { Verdict } from '../data/types';
import { useStore } from '../lib/store';
import { useAiStatus } from '../lib/ai';
import { Segmented } from '../components/liquid';

const mv: Record<string, Verdict> = { true: 'good', partly: 'moderate', myth: 'bad' };

export function Saved() {
  const { saved, toggleSaved, aiProducts } = useStore();
  const [filter, setFilter] = useState<Verdict | 'all'>('all');
  const items = saved.map((k) => {
    const [type, id] = k.split(':');
    if (type === 'product') { const p = productById(id) ?? aiProducts[id]; return p && { k, type, v: p.split ? 'moderate' as Verdict : p.verdict, p }; }
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
  const { profile, setProfile, theme, setTheme, ai, setAi } = useStore();
  const status = useAiStatus();
  const [newAllergy, setNewAllergy] = useState('');
  const glassMode: 'liquid' | 'simple' = document.documentElement.classList.contains('supports-liquid') ? 'liquid' : 'simple';
  const setGlassMode = (m: 'liquid' | 'simple') => {
    try { localStorage.setItem('ahaara.glass', m); } catch { /* storage blocked */ }
    setTimeout(() => location.reload(), 350); // glass filters are built at start-up
  };
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
          <Segmented label="Units" value={profile.units} onChange={(u) => set({ units: u })} options={[{ value: 'household', label: 'Katori / tsp' }, { value: 'metric', label: 'Grams' }]} /></div>
        <div className="divider" />
        <div className="row between"><span className="row"><Icon name={theme === 'dark' ? 'moon' : 'sun'} size={19} /><span style={{ fontWeight: 650 }}>Theme</span></span>
          <Segmented label="Theme" value={theme} onChange={setTheme} options={[{ value: 'dark', label: 'Evening' }, { value: 'light', label: 'Daylight' }]} /></div>
        <div className="divider" />
        <div className="row between"><span className="row"><Icon name="spark" size={19} /><span style={{ fontWeight: 650 }}>Glass effects</span></span>
          <Segmented label="Glass effects" value={glassMode} onChange={setGlassMode}
            options={[{ value: 'liquid', label: 'Liquid' }, { value: 'simple', label: 'Simple' }]} /></div>
        <p className="tiny faint">“Liquid” bends light through the glass (Chrome/Android). “Simple” is lighter on older phones. Animations follow your phone’s “reduce motion” setting.</p>
      </GlassCard>
      <GlassCard className="pad-lg stack">
        <div className="row between"><span className="row"><Icon name="spark" size={19} /><h2 className="h3">AI engine</h2></span>
          <span className="eyebrow">{status === null ? 'checking…' : status.ready ? `${status.providers.filter((p) => p.configured).length} connected` : 'none connected'}</span></div>
        <p className="small muted">Answers anything the built-in library doesn’t cover. “Auto” uses the first connected engine and switches if one fails.</p>
        <div className="row wrap" style={{ gap: 8 }} role="group" aria-label="AI engine">
          <button className="chip tap" aria-pressed={ai.provider === 'auto'} onClick={() => setAi({ ...ai, provider: 'auto' })}>Auto</button>
          {(status?.providers ?? []).map((p) => (
            <button key={p.id} className="chip tap" aria-pressed={ai.provider === p.id} disabled={!p.configured}
              onClick={() => setAi({ ...ai, provider: p.id })} style={p.configured ? undefined : { opacity: 0.45 }}
              title={p.configured ? p.model : 'Add this provider’s API key on the server to enable it'}>
              <span className="dot" style={{ background: p.configured ? 'var(--good)' : 'var(--text-3)' }} />{p.label}
            </button>
          ))}
        </div>
        {status && !status.ready && <p className="tiny faint">No AI keys on the server yet — add one in <span className="num">.env.local</span> or in Vercel’s Environment Variables (see README).</p>}
        {(status?.needsCode || ai.code) && (
          <label className="stack" style={{ gap: 6 }}>
            <span className="small" style={{ fontWeight: 600 }}>Access code</span>
            <input type="password" value={ai.code} onChange={(e) => setAi({ ...ai, code: e.target.value })} placeholder="Ask the person who set up this app"
              className="chip tap" style={{ border: 0, outline: 0, width: '100%' }} autoComplete="off" />
          </label>
        )}
      </GlassCard>

      <Link to="/kit" className="small muted" style={{ textAlign: 'center', minHeight: 44 }}>View the component kit →</Link>
    </div>
  );
}
