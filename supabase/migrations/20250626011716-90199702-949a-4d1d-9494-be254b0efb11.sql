
-- Phase 2: Implementar RLS em tabelas não-críticas de forma segura
-- Estas tabelas não afetam o acesso admin principal

-- 1. Habilitar RLS nas tabelas não-críticas (que não afetam admin)
ALTER TABLE public.case_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_case_history ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para case_images (todos podem ver imagens dos casos)
CREATE POLICY "Anyone can view case images"
  ON public.case_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage case images"
  ON public.case_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND type = 'ADMIN'
    )
  );

-- 3. Políticas para event_cases (todos podem ver casos dos eventos)
CREATE POLICY "Anyone can view event cases"
  ON public.event_cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage event cases"
  ON public.event_cases FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND type = 'ADMIN'
    )
  );

-- 4. Políticas para event_rankings (usuários veem próprios rankings, admins veem todos)
CREATE POLICY "Users can view their own rankings"
  ON public.event_rankings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all rankings"
  ON public.event_rankings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND type = 'ADMIN'
    )
  );

CREATE POLICY "System can manage rankings"
  ON public.event_rankings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND type = 'ADMIN'
    )
  );

-- 5. Políticas para event_registrations (usuários veem próprias inscrições)
CREATE POLICY "Users can view their own registrations"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can register for events"
  ON public.event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all registrations"
  ON public.event_registrations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND type = 'ADMIN'
    )
  );

-- 6. Políticas para ai_tutor_usage_logs (usuários veem próprios logs)
CREATE POLICY "Users can view their own AI tutor logs"
  ON public.ai_tutor_usage_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert AI tutor logs"
  ON public.ai_tutor_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all AI tutor logs"
  ON public.ai_tutor_usage_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND type = 'ADMIN'
    )
  );

-- 7. Políticas para user_case_history (usuários veem próprio histórico)
CREATE POLICY "Users can view their own case history"
  ON public.user_case_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own case history"
  ON public.user_case_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all case history"
  ON public.user_case_history FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND type = 'ADMIN'
    )
  );

-- 8. Função auxiliar para verificar se usuário é admin (evita recursão)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND type = 'ADMIN'
  );
$$;
