import { useState, type ReactNode } from 'react';
import { FloatingSearch } from '../components/chrome';
import {
  AlternativeCard, BackBar, EmergencyBanner, EvidenceChip, ExplainAgainLadder, FrostedSkeleton, GlassCard, GlossaryTerm,
  ProsConsPanel, ProteinTranslator, RangeBar, SaltRing, ScorecardRow, SplitVerdict, SugarTranslator, VerdictBadge,
} from '../components/kit';
import { CompareTable } from './Compare';
import { MythFlipCard } from './Myths';
import { articles, comparePairs, myths } from '../data/content';

function Spec({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="stack">
      <h2 className="eyebrow">{name}</h2>
      {children}
    </section>
  );
}

export default function Kit() {
  const [step, setStep] = useState(1);
  return (
    <div className="page stack-lg">
      <BackBar title="Component kit" />
      <h1 className="h1">Ahaara glass kit</h1>
      <div className="two-col">
        <div className="stack-lg">
          <Spec name="GlassCard · 3 elevation levels">
            <div className="row" style={{ gap: 12, alignItems: 'stretch' }}>
              <GlassCard className="pad grow"><b>Base</b><p className="tiny muted">cards</p></GlassCard>
              <GlassCard level={2} className="pad grow"><b>Raised</b><p className="tiny muted">sheets</p></GlassCard>
              <GlassCard level={3} className="pad grow"><b>Floating</b><p className="tiny muted">nav, search</p></GlassCard>
            </div>
          </Spec>
          <Spec name="VerdictBadge"><div className="row wrap"><VerdictBadge v="good" /><VerdictBadge v="moderate" /><VerdictBadge v="bad" /><VerdictBadge v="good" size="sm" /></div>
            <SplitVerdict items={[{ verdict: 'good', text: 'Good for gym-goers' }, { verdict: 'bad', text: 'Bad as a kids’ daily drink' }]} /></Spec>
          <Spec name="EvidenceChip"><div className="row wrap"><EvidenceChip level="strong" /><EvidenceChip level="moderate" /><EvidenceChip level="weak" /><EvidenceChip level="none" /></div></Spec>
          <Spec name="ScorecardRow"><GlassCard className="pad"><ul><ScorecardRow index={0} item={{ key: 'nutrition', verdict: 'good', detail: 'Example detail.' }} /><ScorecardRow index={1} item={{ key: 'safety', verdict: 'bad', detail: 'Example detail.' }} /></ul></GlassCard></Spec>
          <Spec name="NumberTranslator"><GlassCard className="pad row between wrap"><SugarTranslator grams={14} /><ProteinTranslator grams={11} /><SaltRing grams={0.9} /></GlassCard></Spec>
          <Spec name="ProsConsPanel"><ProsConsPanel good={['Real protein']} bad={['Lots of sugar']} /></Spec>
          <Spec name="AlternativeCard"><AlternativeCard alt={{ name: 'Home-made ragi malt', verdict: 'good', note: 'You control the sugar.', homemade: true, price: '≈ ₹8' }} /></Spec>
          <Spec name="GlossaryTooltip"><GlassCard className="pad"><p>Tap the word <GlossaryTerm term="insulin">insulin</GlossaryTerm> for a simple definition.</p></GlassCard></Spec>
        </div>
        <div className="stack-lg">
          <Spec name="FloatingSearch"><FloatingSearch /></Spec>
          <Spec name="ExplainAgainLadder"><GlassCard className="pad-lg"><ExplainAgainLadder steps={articles[0].ladder} step={step} onStep={setStep} /></GlassCard></Spec>
          <Spec name="MythFlipCard"><MythFlipCard m={myths[1]} /></Spec>
          <Spec name="CompareTable"><GlassCard className="pad"><CompareTable pair={comparePairs[0]} /></GlassCard></Spec>
          <Spec name="RangeBar"><GlassCard className="pad-lg"><RangeBar min={4} max={10} value={6.1} unit="%" zones={[{ upTo: 5.7, label: 'Normal', tone: 'good' }, { upTo: 6.5, label: 'Prediabetes', tone: 'moderate' }, { upTo: 10, label: 'Diabetes', tone: 'bad' }]} /></GlassCard></Spec>
          <Spec name="EmergencyBanner"><div style={{ position: 'relative' }}><EmergencyBanner /></div></Spec>
          <Spec name="FrostedSkeleton"><GlassCard className="pad-lg"><FrostedSkeleton /></GlassCard></Spec>
        </div>
      </div>
    </div>
  );
}
