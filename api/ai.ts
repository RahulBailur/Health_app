import { z } from 'zod';
import { schemas, type JsonTask, type ProfileContext, type Task } from '../shared/schemas.js';
import { isEmergency } from '../shared/safety.js';
import { resolveProviders } from './_lib/providers/index.js';
import type { ImageInput, Provider } from './_lib/providers/types.js';
import { profileLine, systemPrompt } from './_lib/prompts.js';
import { cacheGet, cacheSet, checkAccess, json } from './_lib/guard.js';

/* POST /api/ai — every AI feature goes through here.
   body: { task, provider?, input: { text?, a?, b?, image?, plan?, profile? } } */

const MAX_TEXT = 2000;
const MAX_IMAGE_BYTES = 3_500_000; // base64 chars; client shrinks photos well below this

const Body = z.object({
  task: z.enum(['ask', 'verdict', 'label', 'myth', 'compare', 'mealplan', 'explain']),
  provider: z.string().optional(),
  input: z.object({
    text: z.string().max(MAX_TEXT).optional(),
    a: z.string().max(200).optional(),
    b: z.string().max(200).optional(),
    image: z.string().max(MAX_IMAGE_BYTES).optional(), // data URL
    plan: z.object({ goal: z.string(), diet: z.string(), conditions: z.array(z.string()), activity: z.string() }).optional(),
    profile: z.object({ diet: z.string(), allergies: z.array(z.string()), conditions: z.array(z.string()), country: z.string() }).optional(),
  }),
});
type Input = z.infer<typeof Body>['input'];

/* JSON Schema the providers accept: every property required, no extras. */
function strictSchema(task: JsonTask) {
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk);
    if (!node || typeof node !== 'object') return node;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) if (k !== '$schema') out[k] = walk(v);
    if (out.type === 'object' && out.properties) {
      out.required = Object.keys(out.properties as object);
      out.additionalProperties = false;
    }
    return out;
  };
  return walk(z.toJSONSchema(schemas[task])) as Record<string, unknown>;
}

function parseImage(dataUrl?: string): ImageInput | undefined {
  if (!dataUrl) return undefined;
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) throw new Error('bad_image');
  return { mediaType: m[1] as ImageInput['mediaType'], base64: m[2] };
}

function userPrompt(task: Task, i: Input) {
  const who = profileLine(i.profile as ProfileContext | undefined);
  switch (task) {
    case 'ask': return `${who}\n\nQuestion: ${i.text}`;
    case 'verdict': return `${who}\n\nProduct or food to judge: ${i.text}`;
    case 'label': return `${who}\n\nRead this food label and give the verdict.`;
    case 'myth': return `${who}\n\nClaim or forwarded message:\n"""${i.text}"""`;
    case 'compare': return `${who}\n\nCompare A: ${i.a}\nwith B: ${i.b}`;
    case 'mealplan': return `${who}\n\nGoal: ${i.plan?.goal}. Diet: ${i.plan?.diet}. Conditions: ${i.plan?.conditions.join(', ') || 'none'}. Activity: ${i.plan?.activity}.`;
    case 'explain': return `Topic: ${i.text}`;
  }
}

function missing(task: Task, i: Input) {
  if (task === 'label') return !i.image;
  if (task === 'compare') return !i.a || !i.b;
  if (task === 'mealplan') return !i.plan;
  return !i.text?.trim();
}

const describe = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 200);

export async function POST(req: Request) {
  const blocked = checkAccess(req);
  if (blocked) return blocked;

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return json({ ok: false, error: 'bad_request', message: 'That request didn’t look right.' }, 400);
  }
  const { task, input } = body;
  if (missing(task, input)) return json({ ok: false, error: 'bad_request', message: 'Something is missing from the question.' }, 400);

  // Emergencies are answered by the app itself, immediately — never by waiting on an AI.
  if (input.text && isEmergency(input.text)) return json({ ok: false, error: 'emergency', emergency: true });

  let image: ImageInput | undefined;
  try { image = parseImage(input.image); } catch { return json({ ok: false, error: 'bad_image', message: 'Couldn’t read that photo. Try a JPG or PNG.' }, 400); }

  const providers = resolveProviders(body.provider, Boolean(image));
  if (!providers.length) {
    return json({
      ok: false, error: 'no_provider',
      message: image ? 'No AI engine with photo reading is set up yet.' : 'No AI engine is set up yet. Add an API key in .env.',
    }, 503);
  }

  const system = systemPrompt(task);
  const prompt = userPrompt(task, input);

  if (task === 'ask') return streamAnswer(providers, { system, prompt, image });

  const cacheKey = image ? '' : JSON.stringify([task, providers[0].id, prompt]);
  const hit = cacheKey && cacheGet(cacheKey);
  if (hit) return json(hit);

  const schema = strictSchema(task);
  const errors: string[] = [];
  for (const p of providers) {
    try {
      const raw = await p.json({ system, prompt, image, name: task, schema });
      const data = schemas[task].parse(JSON.parse(raw));
      const result = { ok: true, provider: p.id, providerLabel: p.label, model: p.model, data };
      if (cacheKey) cacheSet(cacheKey, result);
      return json(result);
    } catch (e) {
      errors.push(`${p.label}: ${describe(e)}`);
      console.error(`[ahaara] ${task} via ${p.id} failed:`, e);
    }
  }
  return json({ ok: false, error: 'all_failed', message: 'The AI couldn’t answer right now. Please try again.', details: errors }, 502);
}

/* Streams plain text. Falls back to the next provider only if the current one
   fails before sending anything, so a reader never sees two half-answers. */
function streamAnswer(providers: Provider[], args: { system: string; prompt: string; image?: ImageInput }) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const p of providers) {
        let sent = false;
        try {
          for await (const chunk of p.stream(args)) {
            if (!sent) { controller.enqueue(encoder.encode(`\u0000${p.label}\u0000`)); sent = true; }
            controller.enqueue(encoder.encode(chunk));
          }
          if (sent) { controller.close(); return; }
        } catch (e) {
          console.error(`[ahaara] ask via ${p.id} failed:`, e);
          if (sent) {
            controller.enqueue(encoder.encode('\n\n(The answer was cut off — please ask again.)'));
            controller.close();
            return;
          }
        }
      }
      controller.enqueue(encoder.encode('\u0000none\u0000The AI couldn’t answer right now. Please try again.'));
      controller.close();
    },
  });
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}
