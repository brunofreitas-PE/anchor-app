// Edge Function: process-voice
// Recebe a frase falada ("guardei as chaves na gaveta da cozinha") e devolve
// { success, object, location, confidence }.
//
// Com o segredo ANTHROPIC_API_KEY configurado, usa o Claude para separar objeto e local.
// Sem ele, usa uma regra simples em português, para o app funcionar desde o primeiro dia.
//
// O gateway do Supabase só deixa passar chamadas com um token válido (verify_jwt padrão).

import Anthropic from 'npm:@anthropic-ai/sdk';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Extraction = { object: string; location: string; confidence: number };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

/** Regra simples: "guardei X na/no/em/dentro do Y". */
export function heuristic(texto: string): Extraction | null {
  const t = texto.trim().replace(/[.!?]+$/, '');
  const semVerbo = t.replace(
    /^(eu\s+)?(guardei|deixei|coloquei|botei|pus|larguei|escondi|guardar|deixar|colocar)\s+/i,
    '',
  );
  const m = semVerbo.match(
    /^(.+?)\s+(dentro d[aoe]s?|embaixo d[aoe]s?|em cima d[aoe]s?|atrás d[aoe]s?|ao lado d[aoe]s?|na|no|nas|nos|em|dentro)\s+(.+)$/i,
  );
  if (!m) return null;
  const object = m[1]
    .replace(/^(as?|os?|um|uma|meus?|minhas?)\s+/i, '')
    .replace(/\s+(está|estão|fica|ficou|ficaram)$/i, '')
    .trim();
  const prep = m[2].toLowerCase();
  const rest = m[3].trim();
  const location = ['na', 'no', 'nas', 'nos', 'em'].includes(prep) ? rest : `${prep} ${rest}`;
  if (!object || !location) return null;
  return { object: capitalize(object), location: capitalize(location), confidence: 0.5 };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const SCHEMA = {
  type: 'object',
  properties: {
    object: { type: 'string', description: 'O objeto guardado, curto, ex.: "Chaves do carro"' },
    location: { type: 'string', description: 'Onde foi guardado, ex.: "Gaveta da cozinha"' },
    confidence: { type: 'number', description: 'De 0 a 1' },
  },
  required: ['object', 'location', 'confidence'],
  additionalProperties: false,
};

async function withClaude(texto: string, apiKey: string): Promise<Extraction | null> {
  const client = new Anthropic({ apiKey });
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 1024,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system:
      'Você extrai, de uma frase em português dita por uma pessoa com TDAH, qual objeto ela guardou e onde. ' +
      'Responda com o objeto e o local em poucas palavras, com a primeira letra maiúscula, sem artigos no início. ' +
      'Se a frase não disser o objeto ou o local, deixe o campo vazio e use confiança baixa.',
    messages: [{ role: 'user', content: texto }],
  } as Anthropic.Beta.MessageCreateParamsNonStreaming);

  if (response.stop_reason === 'refusal') return null;
  for (const block of response.content) {
    if (block.type === 'text') {
      const parsed = JSON.parse(block.text) as Extraction;
      if (!parsed.object && !parsed.location) return null;
      return parsed;
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ success: false, error: 'Use POST.' }, 405);

  let texto = '';
  try {
    const body = await req.json();
    texto = typeof body?.texto === 'string' ? body.texto.slice(0, 500) : '';
  } catch {
    return json({ success: false, error: 'JSON inválido.' }, 400);
  }
  if (!texto.trim()) return json({ success: false, error: 'Campo "texto" vazio.' }, 400);

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  let result: Extraction | null = null;
  if (apiKey) {
    try {
      result = await withClaude(texto, apiKey);
    } catch (e) {
      console.error('Falha no Claude, usando regra simples:', e);
    }
  }
  result ??= heuristic(texto);

  if (!result) {
    return json({ success: false, error: 'Não consegui separar objeto e local.' }, 422);
  }
  return json({ success: true, ...result });
});
