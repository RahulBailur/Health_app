/* Browser side of the AI integration. Talks only to our own /api routes —
   API keys live on the server and never reach this code. */
import { useEffect, useState } from 'react';
import type {
  CompareAIT, ExplainAIT, LabelAIT, MealPlanAIT, MythAIT, ProductAIT, ProfileContext, ProviderInfo, Task,
} from '../../shared/schemas';
import type { ComparePair, MealItem, Myth, Product } from '../data/types';
import type { IconName } from '../components/Icon';
import type { Profile } from './store';

export interface AiSettings { provider: string; code: string }
export interface AiOk<T> { ok: true; provider: string; providerLabel: string; model: string; data: T }
export interface AiErr { ok: false; error: string; message?: string; emergency?: boolean }
export type AiResult<T> = AiOk<T> | AiErr;

export const toContext = (p: Profile): ProfileContext => ({ diet: p.diet, allergies: p.allergies, conditions: p.conditions, country: p.country });

/* --------------------------------------------------------------- providers --- */
let providersPromise: Promise<{ providers: ProviderInfo[]; needsCode: boolean } | null> | null = null;
export function fetchProviders(force = false) {
  if (!providersPromise || force) {
    providersPromise = fetch('/api/providers')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (j?.ok ? { providers: j.providers as ProviderInfo[], needsCode: Boolean(j.needsCode) } : null))
      .catch(() => null);
  }
  return providersPromise;
}

/** Whether any AI engine is configured on the server (null while checking). */
export function useAiStatus() {
  const [state, setState] = useState<{ ready: boolean; vision: boolean; providers: ProviderInfo[]; needsCode: boolean } | null>(null);
  useEffect(() => {
    let live = true;
    fetchProviders().then((r) => {
      if (!live) return;
      const providers = r?.providers ?? [];
      const on = providers.filter((p) => p.configured);
      setState({ ready: on.length > 0, vision: on.some((p) => p.vision), providers, needsCode: r?.needsCode ?? false });
    });
    return () => { live = false; };
  }, []);
  return state;
}

/* ------------------------------------------------------------------ calls --- */
interface Input { text?: string; a?: string; b?: string; image?: string; plan?: { goal: string; diet: string; conditions: string[]; activity: string }; profile?: ProfileContext }

export async function runTask<T>(task: Exclude<Task, 'ask'>, input: Input, s: AiSettings): Promise<AiResult<T>> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(s.code ? { 'x-ahaara-code': s.code } : {}) },
      body: JSON.stringify({ task, provider: s.provider, input }),
    });
    const j = await res.json().catch(() => null);
    if (!j) return { ok: false, error: 'network', message: 'Couldn’t reach the AI. Check your connection.' };
    return j as AiResult<T>;
  } catch {
    return { ok: false, error: 'network', message: 'Couldn’t reach the AI. Check your connection.' };
  }
}

/** Streams an answer; calls onText with the growing text. Resolves with the provider label. */
export async function streamAsk(
  text: string, profile: ProfileContext, s: AiSettings, onText: (t: string) => void, signal?: AbortSignal,
): Promise<{ ok: true; provider: string } | AiErr> {
  let res: Response;
  try {
    res = await fetch('/api/ai', {
      method: 'POST', signal,
      headers: { 'content-type': 'application/json', ...(s.code ? { 'x-ahaara-code': s.code } : {}) },
      body: JSON.stringify({ task: 'ask', provider: s.provider, input: { text, profile } }),
    });
  } catch {
    return { ok: false, error: 'network', message: 'Couldn’t reach the AI. Check your connection.' };
  }
  if (!res.ok || !res.body || res.headers.get('content-type')?.includes('application/json')) {
    const j = await res.json().catch(() => null);
    return (j as AiErr) ?? { ok: false, error: 'http', message: 'The AI couldn’t answer right now.' };
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let provider = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    // first frame is \0ProviderLabel\0
    if (!provider) {
      const m = /^\u0000([^\u0000]*)\u0000/.exec(buf);
      if (!m) continue;
      provider = m[1];
      buf = buf.slice(m[0].length);
      if (provider === 'none') return { ok: false, error: 'all_failed', message: buf };
    }
    onText(buf);
  }
  return { ok: true, provider };
}

/* --------------------------------------------------------------- images ---- */
/** Shrinks a photo to ≤1280px JPEG so uploads stay small and fast. */
export async function shrinkImage(source: Blob | HTMLVideoElement, max = 1280): Promise<string> {
  let w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  if (source instanceof HTMLVideoElement) {
    w = source.videoWidth; h = source.videoHeight;
    draw = (ctx, cw, ch) => ctx.drawImage(source, 0, 0, cw, ch);
  } else {
    const bmp = await createImageBitmap(source);
    w = bmp.width; h = bmp.height;
    draw = (ctx, cw, ch) => ctx.drawImage(bmp, 0, 0, cw, ch);
  }
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale); canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  draw(ctx, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

/* ------------------------------------------------------------ converters --- */
const ART_LOOK: Record<ProductAIT['art'], { palette: [string, string]; icon: IconName }> = {
  jar: { palette: ['#7A4126', '#3A1D10'], icon: 'drop' },
  packet: { palette: ['#2F7A55', '#173A2A'], icon: 'wheat' },
  carton: { palette: ['#F4B23C', '#B45309'], icon: 'drop' },
  tub: { palette: ['#ECE6DA', '#9C968B'], icon: 'zap' },
  bag: { palette: ['#7A3E1D', '#4A2410'], icon: 'wheat' },
  box: { palette: ['#4C8A43', '#1F3F1C'], icon: 'leaf' },
};
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'item';

export function toProduct(d: ProductAIT, provider: string): Product {
  const look = ART_LOOK[d.art];
  return {
    id: `ai-${slug(d.name)}`,
    name: d.name, variant: d.variant, pack: d.pack, category: d.category,
    palette: look.palette, icon: look.icon, art: d.art,
    verdict: d.verdict,
    split: d.split.length >= 2 ? d.split : undefined,
    oneLine: d.oneLine, serving: d.serving, perServing: d.perServing, per100: d.per100,
    good: d.good, bad: d.bad, scorecard: d.scorecard,
    safetyNote: d.safetyNote || undefined,
    goodFor: d.goodFor, skipIf: d.skipIf,
    alternatives: d.alternatives.map((a) => ({ ...a, price: a.price || undefined })),
    value: d.value, bottomLine: d.bottomLine, ingredients: d.ingredients, allergens: d.allergens, sources: d.sources,
    ai: { provider, confidence: d.confidence },
  };
}

export function toMyth(d: MythAIT): Myth {
  return { id: `ai-${slug(d.claim)}`, claim: d.claim, verdict: d.verdict, truth: d.truth, origin: d.origin, evidence: d.evidence, todo: d.todo, keywords: [] };
}

export function toComparePair(d: CompareAIT): ComparePair {
  return {
    id: `ai-${slug(`${d.a}-vs-${d.b}`)}`, a: d.a, b: d.b, unit: d.unit, rows: d.rows,
    picks: { 'Weight loss': d.picks.weightLoss, Muscle: d.picks.muscle, Diabetes: d.picks.diabetes, Kids: d.picks.kids, Budget: d.picks.budget },
  };
}

export const toMeals = (d: MealPlanAIT): { items: MealItem[]; tip: string } => ({ items: d.items, tip: d.tip });

export type { LabelAIT, ExplainAIT, ProductAIT, MythAIT, CompareAIT, MealPlanAIT };
