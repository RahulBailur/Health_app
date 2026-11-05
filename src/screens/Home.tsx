import { useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { BrandMark, FloatingSearch } from '../components/chrome';
import { Collapsible, EvidenceChip, GlassCard, ProductMini, VerdictBadge } from '../components/kit';
import { Icon } from '../components/Icon';
import { Liquid, haptic } from '../components/liquid';
import { products } from '../data/products';
import { myths } from '../data/content';
import { useStore } from '../lib/store';

const ACTIONS: { to: string; t: string; s: string }[] = [
  { to: '/scan', t: 'Check a product', s: 'Scan the label, get a straight verdict' },
  { to: '/myths', t: 'Myth buster', s: 'What your WhatsApp group got wrong' },
  { to: '/compare', t: 'Compare two', s: 'Whey or soy · ragi or atta' },
  { to: '/article/insulin-resistance', t: 'Explain simply', s: 'Big ideas, small words' },
  { to: '/conditions', t: 'My condition', s: 'Diabetes, BP, thyroid, PCOS…' },
  { to: '/meal-plan', t: 'Meal plan', s: 'One ordinary Indian day' },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export default function Home() {
  const { profile, theme, setTheme } = useStore();
  const [mythOpen, setMythOpen] = useState(false);
  const myth = myths[0];
  const toggleMyth = () => setMythOpen((o) => !o);

  return (
    <div className="page stack-lg">
      <header className="row between">
        <Link to="/" className="brand hide-desktop"><BrandMark />ahaara</Link>
        <span className="eyebrow show-desktop">{today}</span>
        <div className="row" style={{ gap: 8 }}>
          <Liquid as="button" className="glass-btn" dispersion aria-label={theme === 'dark' ? 'Switch to daylight theme' : 'Switch to evening theme'}
            onClick={() => { haptic(); setTheme(theme === 'dark' ? 'light' : 'dark'); }}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
          </Liquid>
          <Liquid as={Link} to="/profile" className="glass-btn" dispersion aria-label="Profile" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18 }}>{profile.name.charAt(0)}</Liquid>
        </div>
      </header>

      <div className="two-col wide-left">
        <div className="stack-lg">
          <section className="stack stagger" style={{ gap: 18 }}>
            <p className="eyebrow"><span className="hide-desktop" style={{ display: 'inline' }}>{today} · </span>{greeting()}, {profile.name}</p>
            <h1 className="h-display">Is it actually<br /><em>good</em> for you?</h1>
            <p className="muted" style={{ maxWidth: 400 }}>Straight answers about food — like asking a doctor friend over chai.</p>
            <FloatingSearch />
            <div className="row wrap" style={{ gap: 8 }}>
              {['whey vs soy?', 'ghee and cholesterol', 'B12 for vegetarians'].map((s) => (
                <Link key={s} className="chip tap" to={`/ask?q=${encodeURIComponent(s)}`}><Icon name="arrowRight" size={13} style={{ opacity: 0.5 }} />{s}</Link>
              ))}
            </div>
          </section>

          <GlassCard as="nav" className="index" aria-label="What would you like to do?">
            <ul>
              {ACTIONS.map((a, i) => (
                <li key={a.t}>
                  <Link to={a.to}>
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>
                    <span><span className="t">{a.t}</span><span className="s">{a.s}</span></span>
                    <span className="go"><Icon name="arrowRight" size={15} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        <div className="stack-lg">
          <section className="stack">
            <div className="sec-head"><h2 className="eyebrow">Today’s myth</h2><Link className="link" to="/myths">All myths <Icon name="chevronRight" size={14} /></Link></div>
            <GlassCard
              level={2} press className="pad-lg" onClick={toggleMyth} role="button" aria-expanded={mythOpen} tabIndex={0}
              onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMyth(); } }}
            >
              <p className="h1" style={{ fontStyle: 'italic', fontWeight: 400, paddingRight: 8 }}>“{myth.claim}.”</p>
              <div className="row between" style={{ marginTop: 18 }}>
                <span className="small faint">{mythOpen ? 'Tap to close' : 'Tap for what’s actually true'}</span>
                <VerdictBadge v="bad" label="Myth" size="lg" pulse delay={400} />
              </div>
              <Collapsible open={mythOpen}>
                <div className="stack" style={{ paddingTop: 18, marginTop: 18, borderTop: '1px solid var(--hairline)' }}>
                  <p>{myth.truth}</p>
                  <p className="small muted">{myth.origin}</p>
                  <div className="row between"><EvidenceChip level={myth.evidence} /><Link to={`/myths?card=${myth.id}`} className="small" style={{ fontWeight: 650, minHeight: 44, display: 'inline-flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>Open card →</Link></div>
                </div>
              </Collapsible>
            </GlassCard>
          </section>

          <section className="stack" style={{ gap: 0 }}>
            <div className="sec-head"><h2 className="eyebrow">Checked this week</h2><Link className="link" to="/explore">See all <Icon name="chevronRight" size={14} /></Link></div>
            <div className="carousel">
              {products.map((p) => <ProductMini key={p.id} p={p} />)}
            </div>
            <p className="illus">Generic products · illustrative numbers</p>
          </section>
        </div>
      </div>
    </div>
  );
}
