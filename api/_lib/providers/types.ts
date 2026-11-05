import type { ProviderId } from '../../../shared/schemas.js';

export interface ImageInput { mediaType: 'image/jpeg' | 'image/png' | 'image/webp'; base64: string }

export interface GenerateArgs {
  system: string;
  prompt: string;
  image?: ImageInput;
}

export interface JsonArgs extends GenerateArgs {
  name: string; // schema name, e.g. "verdict"
  schema: Record<string, unknown>; // JSON Schema (strict: all required, no extra properties)
}

export interface Provider {
  id: ProviderId;
  label: string;
  model: string;
  vision: boolean;
  /** Streams plain text. */
  stream(args: GenerateArgs): AsyncIterable<string>;
  /** Returns the raw JSON text; the caller parses and validates it. */
  json(args: JsonArgs): Promise<string>;
}

/** The model declined for safety reasons; try the next provider. */
export class RefusalError extends Error {}

export function dataUrl(img: ImageInput) {
  return `data:${img.mediaType};base64,${img.base64}`;
}
