import Anthropic from '@anthropic-ai/sdk';
import { RefusalError, type GenerateArgs, type JsonArgs, type Provider } from './types.js';

/* Claude. Uses the beta Messages endpoint so a safety decline is re-run
   server-side on Anthropic's recommended fallback model ("default"). */
export function claude(apiKey: string): Provider {
  const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 45_000 });
  const model = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';

  const content = (a: GenerateArgs): Anthropic.Beta.BetaContentBlockParam[] => [
    ...(a.image ? [{ type: 'image' as const, source: { type: 'base64' as const, media_type: a.image.mediaType, data: a.image.base64 } }] : []),
    { type: 'text' as const, text: a.prompt },
  ];

  return {
    id: 'claude',
    label: 'Claude',
    model,
    vision: true,
    async *stream(a) {
      const stream = client.beta.messages.stream({
        model,
        max_tokens: 16000,
        system: a.system,
        messages: [{ role: 'user', content: content(a) }],
        output_config: { effort: 'low' }, // conversational answers: fast and cheap
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      });
      for await (const ev of stream) {
        if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') yield ev.delta.text;
      }
      const final = await stream.finalMessage();
      if (final.stop_reason === 'refusal') throw new RefusalError('Claude declined this request');
    },
    async json(a: JsonArgs) {
      const res = await client.beta.messages.create({
        model,
        max_tokens: 16000,
        system: a.system,
        messages: [{ role: 'user', content: content(a) }],
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: a.schema } },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      });
      if (res.stop_reason === 'refusal') throw new RefusalError('Claude declined this request');
      if (res.stop_reason === 'max_tokens') throw new Error('Claude ran out of room before finishing');
      return res.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('');
    },
  };
}
