import OpenAI from 'openai';
import { RefusalError, dataUrl, type GenerateArgs, type JsonArgs, type Provider } from './types.js';

/* ChatGPT via the Chat Completions API. */
export function openai(apiKey: string): Provider {
  const client = new OpenAI({ apiKey, maxRetries: 1, timeout: 45_000 });
  const model = process.env.OPENAI_MODEL || 'gpt-5.5';

  const messages = (a: GenerateArgs): OpenAI.Chat.ChatCompletionMessageParam[] => [
    { role: 'system', content: a.system },
    {
      role: 'user',
      content: [
        ...(a.image ? [{ type: 'image_url' as const, image_url: { url: dataUrl(a.image) } }] : []),
        { type: 'text' as const, text: a.prompt },
      ],
    },
  ];

  return {
    id: 'openai',
    label: 'ChatGPT',
    model,
    vision: true,
    async *stream(a) {
      const stream = await client.chat.completions.create({ model, messages: messages(a), max_completion_tokens: 16000, stream: true });
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) yield text;
      }
    },
    async json(a: JsonArgs) {
      const res = await client.chat.completions.create({
        model,
        messages: messages(a),
        max_completion_tokens: 16000,
        response_format: { type: 'json_schema', json_schema: { name: a.name, schema: a.schema, strict: true } },
      });
      const msg = res.choices[0]?.message;
      if (msg?.refusal) throw new RefusalError(msg.refusal);
      if (!msg?.content) throw new Error('ChatGPT returned an empty answer');
      return msg.content;
    },
  };
}
