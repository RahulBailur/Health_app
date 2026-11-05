import { products } from '../data/products';
import { articles, comparePairs, conditions, myths } from '../data/content';

import { isEmergency, mentionsBloodThinner, needsInteractionWarning } from '../../shared/safety';

export { isEmergency, mentionsBloodThinner, needsInteractionWarning };

export type Hit =
  | { type: 'product'; id: string; title: string; sub: string }
  | { type: 'myth'; id: string; title: string; sub: string }
  | { type: 'article'; id: string; title: string; sub: string }
  | { type: 'condition'; id: string; title: string; sub: string }
  | { type: 'compare'; id: string; title: string; sub: string };


const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2);
const STOP = new Set(['the', 'and', 'for', 'good', 'bad', 'with', 'are', 'can', 'what', 'does', 'how', 'much', 'should', 'eat', 'about', 'safe', 'healthy', 'better', 'than', 'this', 'that', 'have']);

function score(q: string[], text: string) {
  const t = text.toLowerCase();
  return q.reduce((n, w) => n + (t.includes(w) ? (w.length > 4 ? 2 : 1) : 0), 0);
}

export function search(query: string): Hit[] {
  const q = words(query).filter((w) => !STOP.has(w));
  if (!q.length) return [];
  const hits: (Hit & { s: number })[] = [];
  for (const c of comparePairs) {
    const s = score(q, `${c.a} ${c.b} vs versus compare`) + (/\bvs\b|versus|or /i.test(query) ? 1 : 0);
    if (s > 1) hits.push({ type: 'compare', id: c.id, title: `${c.a} vs ${c.b}`, sub: 'Side-by-side comparison', s: s + 1 });
  }
  for (const p of products) {
    const s = score(q, `${p.name} ${p.variant} ${p.category} ${p.goodFor.join(' ')} ${p.skipIf.join(' ')}`);
    if (s) hits.push({ type: 'product', id: p.id, title: p.name, sub: p.oneLine, s: s + (score(q, p.name) ? 2 : 0) });
  }
  for (const m of myths) {
    const s = score(q, `${m.claim} ${m.keywords.join(' ')}`);
    if (s) hits.push({ type: 'myth', id: m.id, title: m.claim, sub: m.truth, s });
  }
  for (const a of articles) {
    const s = score(q, `${a.title} ${a.oneLine}`);
    if (s) hits.push({ type: 'article', id: a.id, title: a.title, sub: a.oneLine, s });
  }
  for (const c of conditions) {
    const s = score(q, `${c.name} ${c.id} ${c.name === 'Diabetes' ? 'sugar diabetic' : ''} ${c.name === 'Blood pressure' ? 'bp hypertension' : ''}`);
    if (s) hits.push({ type: 'condition', id: c.id, title: c.name, sub: c.plain, s });
  }
  return hits.sort((a, b) => b.s - a.s).slice(0, 8);
}

export function matchForward(text: string) {
  const q = words(text);
  let best: { id: string; s: number } | null = null;
  for (const m of myths) {
    const s = m.keywords.reduce((n, k) => n + (text.toLowerCase().includes(k) ? 2 : 0), 0) + score(q, m.claim);
    if (s >= 3 && (!best || s > best.s)) best = { id: m.id, s };
  }
  return best ? myths.find((m) => m.id === best!.id)! : null;
}

export const hrefFor = (h: Hit) =>
  h.type === 'product' ? `/product/${h.id}`
  : h.type === 'myth' ? `/myths?card=${h.id}`
  : h.type === 'article' ? `/article/${h.id}`
  : h.type === 'condition' ? `/conditions/${h.id}`
  : `/compare?pair=${h.id}`;
