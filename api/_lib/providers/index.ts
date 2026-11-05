import type { ProviderId, ProviderInfo } from '../../../shared/schemas.js';
import { claude } from './anthropic.js';
import { openai } from './openai.js';
import { gemini } from './gemini.js';
import { huggingface } from './huggingface.js';
import type { Provider } from './types.js';

const KEYS: Record<ProviderId, string> = {
  claude: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
  huggingface: 'HF_TOKEN',
};
const FACTORIES: Record<ProviderId, (key: string) => Provider> = { claude, openai, gemini, huggingface };
const DEFAULT_ORDER: ProviderId[] = ['claude', 'openai', 'gemini', 'huggingface'];

const isProvider = (s: string): s is ProviderId => s in KEYS;
const key = (id: ProviderId) => process.env[KEYS[id]]?.trim() || '';

function order(): ProviderId[] {
  const fromEnv = (process.env.AI_FALLBACK_ORDER || '').split(',').map((s) => s.trim()).filter(isProvider);
  return [...new Set([...fromEnv, ...DEFAULT_ORDER])];
}

export function listProviders(): ProviderInfo[] {
  return order().map((id) => {
    const k = key(id);
    const p = FACTORIES[id](k || 'unset');
    return { id, label: p.label, configured: Boolean(k), vision: p.vision, model: p.model };
  });
}

/** Providers to try, in order: the requested one first (if configured), then the fallback order. */
export function resolveProviders(requested: string | undefined, needVision: boolean): Provider[] {
  const envDefault = process.env.AI_PROVIDER || 'auto';
  const first = requested && requested !== 'auto' ? requested : envDefault;
  const ids = [...new Set([...(isProvider(first) ? [first] : []), ...order()])];
  return ids.filter((id) => key(id)).map((id) => FACTORIES[id](key(id))).filter((p) => !needVision || p.vision);
}
