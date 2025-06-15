
-- 1. Adiciona campos avançados para eventos-quiz radiológicos
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'quiz_timed', -- tipo (quiz_timed, quiz_livre, etc)
  ADD COLUMN IF NOT EXISTS max_participants integer,             -- limite de inscritos (opcional)
  ADD COLUMN IF NOT EXISTS number_of_cases integer,              -- número de casos do evento
  ADD COLUMN IF NOT EXISTS prize_distribution jsonb,             -- distribuição de radcoins [{position: 1, prize: 500}, ...]
  ADD COLUMN IF NOT EXISTS banner_url text,                      -- banner principal do evento (imagem pública)
  ADD COLUMN IF NOT EXISTS auto_start boolean DEFAULT false,     -- inicia automaticamente na data/hora
  ADD COLUMN IF NOT EXISTS duration_minutes integer,             -- duração (tempo total) do evento em minutos
  ADD COLUMN IF NOT EXISTS case_filters jsonb;                   -- filtros avançados para seleção de casos

-- 2. Atualiza event_cases para conter ordem/sequência dos casos no evento
ALTER TABLE public.event_cases
  ADD COLUMN IF NOT EXISTS sequence smallint; -- para controlar ordem dos casos no evento

-- 3. (opcional) Cria tabela para registrar resultados do ranking final e premiação recebida
CREATE TABLE IF NOT EXISTS public.event_final_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  rank integer NOT NULL,
  radcoins_awarded integer DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Torna o campo prize_distribution obrigatório nos futuros eventos
ALTER TABLE public.events
  ALTER COLUMN prize_radcoins SET DEFAULT 0;
-- (Opcional: Crie checagens ou triggers para evitar distorção futuramente)

-- Permissões RLS para event_final_rankings (admin/usuário inscrito poderá visualizar seus resultados, admin gerencia tudo)
ALTER TABLE public.event_final_rankings ENABLE ROW LEVEL SECURITY;

-- Admin pode manipular tudo
CREATE POLICY "Admin manage event_final_rankings"
  ON public.event_final_rankings
  FOR ALL
  USING (exists (SELECT 1 FROM admin_roles WHERE profile_id = auth.uid()));

-- Usuário pode ver seu resultado
CREATE POLICY "User can view their own event result"
  ON public.event_final_rankings
  FOR SELECT
  USING (user_id = auth.uid());

