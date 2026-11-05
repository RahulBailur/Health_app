import type { IconName, Portion } from '../components/Icon';
import type { ArtKind } from '../components/Art';

export type Verdict = 'good' | 'moderate' | 'bad';
export type Evidence = 'strong' | 'moderate' | 'weak' | 'none';

export interface ScoreItem {
  key: 'nutrition' | 'ingredients' | 'claims' | 'safety' | 'value';
  verdict: Verdict;
  detail: string;
}

export interface Alternative {
  name: string;
  verdict: Verdict;
  note: string;
  homemade?: boolean;
  price?: string;
}

export interface Product {
  id: string;
  name: string;
  variant: string;
  pack: string;
  category: string;
  palette: [string, string];
  icon: IconName;
  art: ArtKind;
  verdict: Verdict;
  /** optional split verdict: who it suits and who should skip */
  split?: { verdict: Verdict; text: string }[];
  oneLine: string;
  serving: string; // e.g. "35 g scoop"
  perServing: { sugar: number; protein: number; salt: number; kcal: number; fibre: number };
  per100: { sugar: number; protein: number; salt: number; kcal: number; fibre: number };
  good: string[];
  bad: string[];
  scorecard: ScoreItem[];
  safetyNote?: string; // red ribbon text when safety matters
  goodFor: string[];
  skipIf: string[];
  alternatives: Alternative[];
  value: { metric: string; items: { label: string; rupees: number; highlight?: boolean }[] };
  bottomLine: string;
  ingredients: string;
  allergens: string[];
  sources: string[];
  /** set when an AI wrote this verdict */
  ai?: { provider: string; confidence: 'high' | 'medium' | 'low' };
}

export interface Myth {
  id: string;
  claim: string;
  verdict: 'true' | 'partly' | 'myth';
  truth: string;
  origin: string;
  evidence: Evidence;
  todo: string;
  keywords: string[];
}

export interface LadderStep { label: string; text: string }

export interface ArticleSection {
  id: string;
  title: string;
  body: string; // supports [[glossary term]] and {{ev:strong}} tokens
  analogy?: { title: string; text: string };
}

export interface Article {
  id: string;
  title: string;
  kind: string;
  icon: IconName;
  oneLine: string;
  ladder: LadderStep[];
  sections: ArticleSection[];
}

export interface Condition {
  id: string;
  name: string;
  icon: IconName;
  plain: string;
  range?: {
    label: string;
    unit: string;
    min: number;
    max: number;
    zones: { upTo: number; label: string; tone: Verdict }[];
    sample: number;
  };
  helps: { text: string; ev: Evidence }[];
  limit: string[];
  doctor: string[];
}

export interface MealItem {
  slot: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  time: string;
  dish: string;
  portions: { kind: Portion; label: string }[];
  protein: number;
  fibre: number;
  note?: string;
}

export interface ComparePair {
  id: string;
  a: string;
  b: string;
  unit: string;
  rows: { label: string; a: string; b: string; better: 'a' | 'b' | 'tie' }[];
  picks: Record<string, { pick: 'a' | 'b' | 'tie'; why: string }>;
}
