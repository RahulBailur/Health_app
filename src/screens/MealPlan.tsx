import { useState } from 'react';
import { AiNote, AiTag, BackBar, FrostedSkeleton, GlassCard } from '../components/kit';
import type { MealItem } from '../data/types';
import { runTask, toContext, toMeals, useAiStatus, type MealPlanAIT } from '../lib/ai';
import { Icon, PortionIcon } from '../components/Icon';
import { mealPlan } from '../data/content';
import { useStore } from '../lib/store';

const GOALS = ['Lose weight', 'Build muscle', 'Eat healthier', 'Manage sugar'];
const DIETS: [string, string][] = [['veg', 'Veg'], ['nonveg', 'Non-veg'], ['vegan', 'Vegan'], ['jain', 'Jain'], ['egg', 'Eggetarian']];
const CONDS = ['None', 'Diabetes', 'BP', 'Thyroid', 'PCOS', 'Cholesterol'];
const ACTIVITY = ['Mostly sitting', 'Light', 'Active', 'Very active'];

function Toggle({ options, value, onChange, multi }: { options: [string, string][]; value: string[]; onChange: (v: string[]) => void; multi?: boolean }) {
  return (
    <div className="row wrap" style={{ gap: 8 }}>
      {options.map(([k, l]) => (
        <button key={k} className="chip lg" aria-pressed={value.includes(k)}
          onClick={() => onChange(multi ? (value.includes(k) ? value.filter((x) => x !== k) : [...value.filter((x) => x !== 'None'), k]) : [k])}>
          {l}
        </button>
      ))}
    </div>
  );
}

export default function MealPlan() {
  const { profile } = useStore();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(['Eat healthier']);
  const [diet, setDiet] = useState([profile.diet.toLowerCase().startsWith('veg') ? 'veg' : 'nonveg']);
  const [conds, setConds] = useState(['None']);
  const [act, setAct] = useState(['Light']);
  const status = useAiStatus();
  const { ai } = useStore();
  const [aiPlan, setAiPlan] = useState<{ items: MealItem[]; tip: string; by: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const plan = aiPlan?.items ?? mealPlan[diet[0]] ?? mealPlan.veg;
  const dietLabel = DIETS.find((d) => d[0] === diet[0])?.[1] ?? 'Veg';
  const next = async () => {
    if (step < steps.length - 1) { setStep(step + 1); return; }
    setStep(step + 1);
    setAiPlan(null); setErr('');
    if (!status?.ready) return;
    setLoading(true);
    const r = await runTask<MealPlanAIT>('mealplan', {
      plan: { goal: goal[0], diet: dietLabel, conditions: conds.filter((c) => c !== 'None'), activity: act[0] },
      profile: toContext(profile),
    }, ai);
    setLoading(false);
    if (r.ok) setAiPlan({ ...toMeals(r.data), by: r.providerLabel });
    else setErr(r.message ?? 'Showing a standard plan instead.');
  };
  const totals = plan.reduce((t, m) => ({ p: t.p + m.protein, f: t.f + m.fibre }), { p: 0, f: 0 });

  const steps = [
    { q: 'What’s your goal?', el: <Toggle options={GOALS.map((g) => [g, g])} value={goal} onChange={setGoal} /> },
    { q: 'How do you eat?', el: <Toggle options={DIETS} value={diet} onChange={setDiet} /> },
    { q: 'Anything we should plan around?', el: <Toggle multi options={CONDS.map((g) => [g, g])} value={conds} onChange={(v) => setConds(v.length ? v : ['None'])} /> },
    { q: 'How active are you?', el: <Toggle options={ACTIVITY.map((g) => [g, g])} value={act} onChange={setAct} /> },
  ];

  if (step < steps.length) {
    return (
      <div className="page stack-lg" style={{ maxWidth: 640 }}>
        <BackBar title="Meal plan" />
        <div className="row" style={{ gap: 6 }}>{steps.map((_, i) => <div key={i} className="grow" style={{ height: 4, borderRadius: 4, background: i <= step ? 'var(--accent)' : 'var(--hairline)', transition: 'background .3s' }} />)}</div>
        <GlassCard level={2} className="pad-lg stack-lg page" key={step}>
          <div><span className="eyebrow">Step {step + 1} of {steps.length}</span><h1 className="h1" style={{ marginTop: 6 }}>{steps[step].q}</h1></div>
          {steps[step].el}
          <div className="row">
            {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
            <button className="btn btn-primary grow" onClick={next}>{step === steps.length - 1 ? 'Show my day' : 'Next'}<Icon name="arrowRight" size={18} /></button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page stack-lg">
      <BackBar title="Meal plan" right={<button className="icon-btn" aria-label="Edit answers" onClick={() => setStep(0)}><Icon name="sliders" size={19} /></button>} />
      <header className="stack" style={{ gap: 8 }}>
        <h1 className="h1">A sample day</h1>
        <div className="row wrap" style={{ gap: 8 }}>
          {[goal[0], DIETS.find((d) => d[0] === diet[0])?.[1], ...conds.filter((c) => c !== 'None'), act[0]].map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
        {aiPlan && <div className="row between"><AiTag provider={aiPlan.by} /><span className="illus">made for you</span></div>}
        {err && <p className="small" style={{ color: 'var(--moderate)' }}>{err}</p>}
      </header>
      {loading && <GlassCard className="pad-lg stack"><span className="eyebrow">Planning your day…</span><FrostedSkeleton lines={5} height={14} /></GlassCard>}

      <div className="two-col wide-left">
        <ol className="timeline">
          {plan.map((m) => (
            <li key={m.slot} style={{ position: 'relative' }}>
              <span className="node" />
              <GlassCard press className="pad stack" style={{ gap: 10 }}>
                <div className="row between"><span className="eyebrow">{m.slot}</span><span className="tiny faint num">{m.time}</span></div>
                <p className="h3">{m.dish}</p>
                <div className="row wrap" style={{ gap: 14 }}>
                  {m.portions.map((p) => (
                    <span key={p.label} className="row small muted" style={{ gap: 6 }}><span style={{ color: 'var(--accent)' }}><PortionIcon kind={p.kind} size={26} /></span>{p.label}</span>
                  ))}
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span className="chip"><span className="dot" style={{ background: 'var(--accent)' }} /><span className="num">{m.protein} g</span> protein</span>
                  <span className="chip"><span className="dot" style={{ background: 'var(--turmeric)' }} /><span className="num">{m.fibre} g</span> fibre</span>
                </div>
              </GlassCard>
            </li>
          ))}
        </ol>

        <div className="stack-lg sticky-col">
          <GlassCard level={2} className="pad-lg row between">
            <div><span className="eyebrow">Day total</span><div className="h1 num">{totals.p} g</div><span className="small muted">protein</span></div>
            <div style={{ textAlign: 'right' }}><div className="h1 num" style={{ marginTop: 18 }}>{totals.f} g</div><span className="small muted">fibre (aim 25–30 g)</span></div>
          </GlassCard>
          <GlassCard className="pad-lg stack" tint="good">
            <div className="row"><Icon name="leaf" size={20} style={{ color: 'var(--good)' }} /><h2 className="h3">Habits over crash diets</h2></div>
            <p className="small">{aiPlan?.tip ?? 'Pick one change for two weeks — like adding a katori of dal or curd to lunch. Small swaps you keep beat a strict plan you drop on day five.'}</p>
          </GlassCard>
          <GlassCard className="pad stack">
            <span className="eyebrow">Portion guide</span>
            <div className="row wrap" style={{ gap: 16 }}>
              {([['katori', 'Katori ≈ 150 ml'], ['palm', 'Palm = protein'], ['fist', 'Fist = grains'], ['cupped', 'Cupped hand = snack']] as const).map(([k, l]) => (
                <span key={k} className="row small muted" style={{ gap: 6 }}><span style={{ color: 'var(--accent)' }}><PortionIcon kind={k} /></span>{l}</span>
              ))}
            </div>
          </GlassCard>
          {aiPlan && <AiNote />}
          <p className="tiny faint">A sample, not a prescription. With diabetes, kidney disease or pregnancy, check portions with your doctor or dietitian.</p>
        </div>
      </div>
    </div>
  );
}
