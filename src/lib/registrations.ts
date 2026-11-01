import { supabase } from '@/lib/supabase';

/** Um objeto "ancorado" a um local. Espelha a tabela public.registrations. */
export type Registration = {
  id: string;
  user_id: string;
  object: string;
  location: string;
  raw_text: string | null;
  confidence: number | null;
  retrieved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Extraction = { object: string; location: string; confidence: number | null };

/**
 * Envia a frase falada para a Edge Function process-voice.
 * O cliente Supabase manda o token do usuário logado, não a chave anônima,
 * para a função saber quem está chamando.
 */
export async function extractFromText(texto: string): Promise<Extraction> {
  const { data, error } = await supabase.functions.invoke('process-voice', { body: { texto } });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error ?? 'Não consegui entender a frase.');
  return {
    object: String(data.object ?? ''),
    location: String(data.location ?? ''),
    confidence: typeof data.confidence === 'number' ? data.confidence : null,
  };
}

/** Objetos ainda guardados (não marcados como "peguei de volta"), mais recentes primeiro. */
export async function listActive(limit?: number): Promise<Registration[]> {
  let q = supabase
    .from('registrations')
    .select('*')
    .is('retrieved_at', null)
    .order('created_at', { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

/** Busca por objeto ou local. A RLS garante que só voltam registros do próprio usuário. */
export async function search(term: string): Promise<Registration[]> {
  const t = term.trim().replace(/[%,()]/g, ' ');
  if (!t) return listActive();
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .is('retrieved_at', null)
    .or(`object.ilike.%${t}%,location.ilike.%${t}%`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getRegistration(id: string): Promise<Registration> {
  const { data, error } = await supabase.from('registrations').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createRegistration(input: {
  object: string;
  location: string;
  raw_text?: string;
  confidence?: number | null;
}): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Sessão expirada. Entre de novo.');
  const { error } = await supabase.from('registrations').insert({
    user_id: auth.user.id,
    object: input.object.trim(),
    location: input.location.trim(),
    raw_text: input.raw_text ?? null,
    confidence: input.confidence ?? null,
  });
  if (error) throw error;
}

export async function updateRegistration(
  id: string,
  patch: { object: string; location: string },
): Promise<void> {
  const { error } = await supabase
    .from('registrations')
    .update({ object: patch.object.trim(), location: patch.location.trim() })
    .eq('id', id);
  if (error) throw error;
}

export async function markRetrieved(id: string): Promise<void> {
  const { error } = await supabase
    .from('registrations')
    .update({ retrieved_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteRegistration(id: string): Promise<void> {
  const { error } = await supabase.from('registrations').delete().eq('id', id);
  if (error) throw error;
}

/** "há 10 min", "ontem", "3 dias" */
export function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ontem';
  if (d < 7) return `${d} dias`;
  return `${Math.floor(d / 7)} sem.`;
}
