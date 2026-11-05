/* Shapes the AI must return for each task. The server validates every answer
   against these before the app sees it; the app only imports the types. */
import { z } from 'zod';

export const Verdict = z.enum(['good', 'moderate', 'bad']);
export const Evidence = z.enum(['strong', 'moderate', 'weak', 'none']);

const Numbers = z.object({
  sugar: z.number().describe('grams'),
  protein: z.number().describe('grams'),
  salt: z.number().describe('grams of salt (sodium mg × 2.5 / 1000)'),
  kcal: z.number(),
  fibre: z.number().describe('grams'),
});

export const ProductAI = z.object({
  name: z.string().describe('Generic product name, never a brand'),
  variant: z.string(),
  pack: z.string().describe('Typical pack size, e.g. "400 g jar"'),
  category: z.string().describe('Short category, e.g. "Health drinks", "Snacks", "Staples"'),
  art: z.enum(['jar', 'packet', 'carton', 'tub', 'bag', 'box']).describe('Closest packaging shape'),
  verdict: Verdict,
  split: z.array(z.object({ verdict: Verdict, text: z.string().describe('Who this applies to, e.g. "for adults short on protein"') }))
    .describe('Two entries when the honest answer depends on who is eating it, otherwise empty'),
  oneLine: z.string().describe('The single main reason for the verdict, one sentence'),
  serving: z.string().describe('Typical serving, e.g. "35 g scoop"'),
  perServing: Numbers,
  per100: Numbers,
  good: z.array(z.string()).describe('3-5 short good points'),
  bad: z.array(z.string()).describe('3-5 short negative points'),
  scorecard: z.array(z.object({
    key: z.enum(['nutrition', 'ingredients', 'claims', 'safety', 'value']),
    verdict: Verdict,
    detail: z.string().describe('One short paragraph'),
  })).describe('Exactly five rows, one per key, in that order'),
  safetyNote: z.string().describe('Empty unless safety is bad; then who must avoid it'),
  goodFor: z.array(z.string()),
  skipIf: z.array(z.string()),
  alternatives: z.array(z.object({
    name: z.string(), verdict: Verdict, note: z.string(), homemade: z.boolean(), price: z.string().describe('Rough ₹ cost or empty'),
  })).describe('1-3 better or cheaper options; at least one home-made'),
  value: z.object({
    metric: z.string().describe('e.g. "₹ per 25 g protein"'),
    items: z.array(z.object({ label: z.string(), rupees: z.number(), highlight: z.boolean() })).describe('This product first with highlight true, then 2-3 whole-food comparisons'),
  }),
  bottomLine: z.string(),
  ingredients: z.string().describe('Typical ingredient list for this kind of product'),
  allergens: z.array(z.string()).describe('Lower-case: milk, soy, gluten, peanuts, tree nuts, egg, fish, sesame…'),
  sources: z.array(z.string()).describe('Only well-known bodies or the label (e.g. "ICMR-NIN Dietary Guidelines for Indians"). Never invent studies or URLs.'),
  confidence: z.enum(['high', 'medium', 'low']).describe('low when the product is vague or unknown'),
});

export const LabelAI = z.object({
  readable: z.boolean().describe('false if the photo is not a food label or is unreadable'),
  problem: z.string().describe('If not readable, what to fix (light, focus, angle). Else empty'),
  redFlags: z.array(z.string()).describe('Exact words from the ingredients that are hidden sugars, palm oil, hydrogenated fat, etc.'),
  product: ProductAI,
});

export const MythAI = z.object({
  claim: z.string().describe('The claim restated in under 12 words'),
  verdict: z.enum(['true', 'partly', 'myth']),
  truth: z.string(),
  origin: z.string().describe('Where the belief comes from, said kindly'),
  evidence: Evidence,
  todo: z.string().describe('What to actually do'),
});

const Pick = z.object({ pick: z.enum(['a', 'b', 'tie']), why: z.string() });
export const CompareAI = z.object({
  a: z.string(),
  b: z.string(),
  unit: z.string().describe('Basis for the numbers, e.g. "per 100 g" or "per 1 katori cooked"'),
  rows: z.array(z.object({ label: z.string(), a: z.string(), b: z.string(), better: z.enum(['a', 'b', 'tie']) }))
    .describe('6-8 rows: calories, protein, sugar, fibre, fat type, price, key nutrient'),
  picks: z.object({ weightLoss: Pick, muscle: Pick, diabetes: Pick, kids: Pick, budget: Pick }),
});

export const MealPlanAI = z.object({
  items: z.array(z.object({
    slot: z.enum(['Breakfast', 'Lunch', 'Snack', 'Dinner']),
    time: z.string().describe('24h, e.g. "8:00"'),
    dish: z.string(),
    portions: z.array(z.object({ kind: z.enum(['katori', 'palm', 'fist', 'cupped', 'tsp', 'glass', 'piece']), label: z.string() })),
    protein: z.number(),
    fibre: z.number(),
  })).describe('Exactly four meals in order'),
  tip: z.string().describe('One habit-over-crash-diet tip for this person'),
});

export const ExplainAI = z.object({
  steps: z.array(z.object({ label: z.string(), text: z.string() }))
    .describe('Exactly four: "One line", "Analogy", "Example", "In numbers"'),
});

export const schemas = { verdict: ProductAI, label: LabelAI, myth: MythAI, compare: CompareAI, mealplan: MealPlanAI, explain: ExplainAI } as const;
export type JsonTask = keyof typeof schemas;
export type Task = JsonTask | 'ask';

export type ProductAIT = z.infer<typeof ProductAI>;
export type LabelAIT = z.infer<typeof LabelAI>;
export type MythAIT = z.infer<typeof MythAI>;
export type CompareAIT = z.infer<typeof CompareAI>;
export type MealPlanAIT = z.infer<typeof MealPlanAI>;
export type ExplainAIT = z.infer<typeof ExplainAI>;

export interface ProfileContext { diet: string; allergies: string[]; conditions: string[]; country: string }

export type ProviderId = 'claude' | 'openai' | 'gemini' | 'huggingface';
export interface ProviderInfo { id: ProviderId; label: string; configured: boolean; vision: boolean; model: string }
