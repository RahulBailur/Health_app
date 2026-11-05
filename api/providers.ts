import { listProviders } from './_lib/providers/index.js';
import { json } from './_lib/guard.js';

/* GET /api/providers — which AI engines have keys, so the app can show a picker.
   Never returns the keys themselves. */
export function GET() {
  return json({
    ok: true,
    providers: listProviders(),
    default: process.env.AI_PROVIDER || 'auto',
    needsCode: Boolean(process.env.APP_ACCESS_CODE?.trim()),
  });
}
