-- CORREÇÃO DAS POLÍTICAS RLS DOS RANKINGS DE EVENTOS
-- Problema: Usuários não conseguem ver rankings públicos, quebrando a gamificação

-- 1. ADICIONAR POLÍTICA PÚBLICA PARA RANKINGS DE EVENTOS ATIVOS
CREATE POLICY "Public can view active event rankings"
ON public.event_rankings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_rankings.event_id 
    AND events.status = 'ACTIVE'
  )
);

-- 2. ADICIONAR POLÍTICA PÚBLICA PARA RANKINGS DE EVENTOS FINALIZADOS
CREATE POLICY "Public can view finished event rankings"
ON public.event_rankings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_rankings.event_id 
    AND events.status = 'FINISHED'
  )
);

-- 3. PERMITIR VISUALIZAÇÃO PÚBLICA DE CONTAGEM DE PARTICIPANTES
CREATE POLICY "Public can view event registrations count"
ON public.event_registrations
FOR SELECT
USING (true);

-- 4. COMENTAR SOBRE AS CORREÇÕES
COMMENT ON POLICY "Public can view active event rankings" ON public.event_rankings IS 
'Permite que todos vejam rankings de eventos ativos para competição em tempo real';

COMMENT ON POLICY "Public can view finished event rankings" ON public.event_rankings IS 
'Permite que todos vejam rankings históricos para Hall da Fama e motivação';

COMMENT ON POLICY "Public can view event registrations count" ON public.event_registrations IS 
'Permite contagem pública de participantes sem expor dados pessoais';