import { useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BackBar, Collapsible, ExplainAgainLadder, GlassCard, RichText, Sheet } from '../components/kit';
import { Icon } from '../components/Icon';
import { articles } from '../data/content';

export default function Article() {
  const { id = '' } = useParams();
  const a = articles.find((x) => x.id === id);
  const [open, setOpen] = useState<Record<string, boolean>>({ how: true });
  const [ladderOpen, setLadderOpen] = useState(false);
  const [step, setStep] = useState(0);

  if (!a) return <div className="page stack"><BackBar /><GlassCard className="pad-lg">Article not found. <Link to="/explore">Browse the encyclopedia</Link>.</GlassCard></div>;

  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const nextExplanation = () => { setStep((s) => Math.max(s, 1)); setLadderOpen(true); };

  return (
    <div className="page stack-lg" style={{ maxWidth: 760 }}>
      <BackBar title={a.kind} />
      <header className="stack stagger">
        <span className="tile-icon" style={{ '--ic': '#C4B5FD', width: 52, height: 52, borderRadius: 18 } as CSSProperties}><Icon name={a.icon} size={26} /></span>
        <h1 className="h-display">{a.title}</h1>
        <GlassCard level={2} className="pad-lg stack" style={{ gap: 8 }}>
          <span className="eyebrow">In one line</span>
          <p className="lede">{a.oneLine}</p>
        </GlassCard>
      </header>

      <div className="stack">
        {a.sections.map((s) => (
          <GlassCard key={s.id} className={`pad ${open[s.id] ? 'open' : ''}`}>
            <button className="row between" style={{ width: '100%', minHeight: 44, textAlign: 'left' }} aria-expanded={!!open[s.id]} onClick={() => toggle(s.id)}>
              <h2 className="h3">{s.title}</h2>
              <Icon name="chevronDown" size={18} className="chev" style={{ transform: open[s.id] ? 'rotate(180deg)' : undefined }} />
            </button>
            <Collapsible open={!!open[s.id]}>
              <div className="stack" style={{ paddingTop: 8 }}>
                <p style={{ lineHeight: 1.75 }}><RichText text={s.body} /></p>
                {s.analogy && (
                  <GlassCard level={2} tint="good" className="pad stack" style={{ gap: 12 }}>
                    <div className="row" style={{ gap: 14 }}>
                      <svg width="72" height="56" viewBox="0 0 72 56" aria-hidden style={{ flex: 'none' }}>
                        <defs><linearGradient id="kg" x1="0" x2="1"><stop offset="0" stopColor="#FDE68A" /><stop offset="1" stopColor="#F59E0B" /></linearGradient></defs>
                        <circle cx="16" cy="28" r="11" fill="none" stroke="url(#kg)" strokeWidth="4" />
                        <path d="M27 28h22M41 28v8M48 28v6" stroke="url(#kg)" strokeWidth="4" strokeLinecap="round" />
                        <rect x="52" y="14" width="18" height="28" rx="4" fill="none" stroke="#A8A29E" strokeWidth="3" strokeDasharray="3 2" />
                        <circle cx="61" cy="26" r="3" fill="#A8A29E" />
                        <path d="M58 33c2 1 4 1 6 0" stroke="#B45309" strokeWidth="2" opacity=".8" />
                      </svg>
                      <div><span className="eyebrow">Analogy</span><div className="h3">{s.analogy.title}</div></div>
                    </div>
                    <p className="small">{s.analogy.text}</p>
                  </GlassCard>
                )}
              </div>
            </Collapsible>
          </GlassCard>
        ))}
        <GlassCard level={2} className="pad-lg stack" style={{ gap: 8 }}>
          <span className="eyebrow">Bottom line</span>
          <p className="lede" style={{ fontSize: 18 }}>{a.ladder[0].text}</p>
        </GlassCard>
        <p className="small muted" style={{ textAlign: 'center' }}>Underlined words have a simple definition — tap them.</p>
      </div>

      <button className="btn btn-primary" onClick={nextExplanation}
        style={{ position: 'fixed', zIndex: 35, right: 20, bottom: 'calc(var(--nav-h) + 30px + env(safe-area-inset-bottom))' }}>
        <Icon name="ladder" size={18} />Didn’t get it?
      </button>

      <Sheet open={ladderOpen} onClose={() => setLadderOpen(false)} label="Explain it differently">
        <div className="stack-lg">
          <div><span className="eyebrow">Explain it differently</span><h2 className="h2" style={{ marginTop: 4 }}>{a.title}</h2></div>
          <ExplainAgainLadder steps={a.ladder} step={step} onStep={setStep} />
          <div className="row">
            <button className="btn btn-ghost grow" onClick={() => setLadderOpen(false)}>Got it</button>
            {step < a.ladder.length - 1 && <button className="btn btn-primary grow" onClick={() => setStep(step + 1)}>Still unclear<Icon name="arrowRight" size={18} /></button>}
          </div>
          <p className="small muted" style={{ textAlign: 'center' }}>Does that make sense, or should I explain it differently?</p>
        </div>
      </Sheet>
    </div>
  );
}
