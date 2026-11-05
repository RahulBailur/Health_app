import { InferenceClient } from '@huggingface/inference';
import { dataUrl, type GenerateArgs, type JsonArgs, type Provider } from './types.js';

/* Hugging Face Inference Providers. Open models vary in what they support, so
   JSON is requested in the prompt and validated by the caller; photos are only
   sent when HF_VISION_MODEL names a vision-capable model. */
export function huggingface(token: string): Provider {
  const client = new InferenceClient(token);
  const model = process.env.HF_MODEL || 'Qwen/Qwen3-32B';
  const visionModel = process.env.HF_VISION_MODEL || '';

  const stripThinking = (s: string) => s.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  const messages = (a: GenerateArgs, extra = '') => [
    { role: 'system' as const, content: a.system + extra },
    {
      role: 'user' as const,
      content: a.image
        ? [{ type: 'image_url' as const, image_url: { url: dataUrl(a.image) } }, { type: 'text' as const, text: a.prompt }]
        : a.prompt,
    },
  ];

  return {
    id: 'huggingface',
    label: 'Hugging Face',
    model,
    vision: Boolean(visionModel),
    async *stream(a) {
      let inThink = false;
      for await (const chunk of client.chatCompletionStream({ model: a.image ? visionModel : model, messages: messages(a), max_tokens: 4000 })) {
        let text = chunk.choices?.[0]?.delta?.content ?? '';
        // hide <think>…</think> reasoning that some open models emit
        if (text.includes('<think>')) { inThink = true; text = text.split('<think>')[0]; }
        if (inThink) {
          if (!text.includes('</think>')) continue;
          inThink = false; text = text.split('</think>').pop() ?? '';
        }
        if (text) yield text;
      }
    },
    async json(a: JsonArgs) {
      const res = await client.chatCompletion({
        model: a.image ? visionModel : model,
        messages: messages(a, `\n\nReply with ONLY a JSON object (no prose, no code fences) that matches this JSON Schema:\n${JSON.stringify(a.schema)}`),
        max_tokens: 6000,
      });
      const text = stripThinking(res.choices?.[0]?.message?.content ?? '');
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start < 0 || end < start) throw new Error('Hugging Face model did not return JSON');
      return text.slice(start, end + 1);
    },
  };
}
