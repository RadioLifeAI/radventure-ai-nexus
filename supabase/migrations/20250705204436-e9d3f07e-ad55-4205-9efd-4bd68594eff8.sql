-- CORRIGIR RLS PARA event_final_rankings
-- Permitir acesso público aos rankings finalizados

-- Criar políticas RLS para event_final_rankings
CREATE POLICY "Anyone can view final rankings"
ON public.event_final_rankings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage final rankings"
ON public.event_final_rankings 
FOR ALL 
USING (get_user_type(auth.uid()) = 'ADMIN'::profile_type);