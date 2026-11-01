-- Banco do Anchor, criado do zero.
-- Como rodar: Supabase > SQL Editor > New query > cole este arquivo inteiro > Run.
-- Pode rodar mais de uma vez sem estragar nada.

-- Mantém updated_at sempre atualizado.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- registrations: cada objeto "ancorado" a um local.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registrations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  object       text NOT NULL CHECK (char_length(object) BETWEEN 1 AND 200),
  location     text NOT NULL CHECK (char_length(location) BETWEEN 1 AND 300),
  raw_text     text,
  confidence   double precision,
  retrieved_at timestamptz,               -- "peguei de volta"
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS registrations_user_active_idx
  ON public.registrations (user_id, created_at DESC)
  WHERE retrieved_at IS NULL;

DROP TRIGGER IF EXISTS registrations_updated_at ON public.registrations;
CREATE TRIGGER registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "registrations: dono lê"    ON public.registrations;
DROP POLICY IF EXISTS "registrations: dono cria"  ON public.registrations;
DROP POLICY IF EXISTS "registrations: dono edita" ON public.registrations;
DROP POLICY IF EXISTS "registrations: dono apaga" ON public.registrations;

CREATE POLICY "registrations: dono lê" ON public.registrations
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "registrations: dono cria" ON public.registrations
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "registrations: dono edita" ON public.registrations
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "registrations: dono apaga" ON public.registrations
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- subscriptions: plano de cada pessoa. O usuário só LÊ o próprio plano;
-- quem altera é o servidor (service_role, webhook de pagamento).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan               text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  status             text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'canceled', 'expired')),
  current_period_end timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions: dono lê" ON public.subscriptions;
CREATE POLICY "subscriptions: dono lê" ON public.subscriptions
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
-- De propósito, não há política de INSERT/UPDATE/DELETE para usuários.

-- Toda conta nova começa no plano gratuito.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- A tabela de parceiros (códigos de médicos e terapeutas) fica para depois do MVP.
