-- Ajustes do MVP no banco do Anchor.
-- ATENÇÃO: o SQL original do handoff veio truncado no PDF. Antes de rodar,
-- confira no painel do Supabase (Table Editor) se as colunas abaixo batem com
-- a tabela real. Tudo aqui usa IF NOT EXISTS / IF EXISTS para ser seguro de repetir.

-- 1) Colunas que o app usa em registrations.
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS object       text,
  ADD COLUMN IF NOT EXISTS location     text,
  ADD COLUMN IF NOT EXISTS raw_text     text,
  ADD COLUMN IF NOT EXISTS confidence   double precision,
  ADD COLUMN IF NOT EXISTS retrieved_at timestamptz; -- "peguei de volta"

-- Busca rápida dos objetos ainda guardados de cada pessoa.
CREATE INDEX IF NOT EXISTS registrations_user_active_idx
  ON public.registrations (user_id, created_at DESC)
  WHERE retrieved_at IS NULL;

-- 2) Falha de segurança: o usuário conseguia mudar o próprio plano para Premium.
-- O plano passa a ser alterado só pelo servidor (service_role / webhook de pagamento).
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
