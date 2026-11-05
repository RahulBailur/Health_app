import { GoogleGenAI } from '@google/genai';
import type { GenerateArgs, JsonArgs, Provider } from './types.js';

/* Google Gemini via the Gen AI SDK (Google AI Studio key). */
export function gemini(apiKey: string): Provider {
  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 45_000 } });
  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';

  const contents = (a: GenerateArgs) => [{
    role: 'user',
    parts: [
      ...(a.image ? [{ inlineData: { mimeType: a.image.mediaType, data: a.image.base64 } }] : []),
      { text: a.prompt },
    ],
  }];

  return {
    id: 'gemini',
    label: 'Gemini',
    model,
    vision: true,
    async *stream(a) {
      const stream = await ai.models.generateContentStream({
        model,
        contents: contents(a),
        config: { systemInstruction: a.system, maxOutputTokens: 16000 },
      });
      for await (const chunk of stream) {
        if (chunk.text) yield chunk.text;
      }
    },
    async json(a: JsonArgs) {
      const res = await ai.models.generateContent({
        model,
        contents: contents(a),
        config: { systemInstruction: a.system, maxOutputTokens: 16000, responseMimeType: 'application/json', responseJsonSchema: a.schema },
      });
      if (!res.text) throw new Error('Gemini returned an empty answer');
      return res.text;
    },
  };
}
