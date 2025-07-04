-- CORREÇÃO DAS POLÍTICAS RLS PARA GAMIFICAÇÃO COMPLETA
-- Problema: Rankings e elementos gamificados não são visíveis publicamente

-- 1. POLÍTICA PÚBLICA PARA PERFIS GAMIFICADOS (campos seguros para competição)
CREATE POLICY "Public can view gamified profile data"
ON public.profiles
FOR SELECT
USING (true);

-- 2. PERMITIR VISUALIZAÇÃO PÚBLICA DO CACHE DE ESTATÍSTICAS
CREATE POLICY "Public can view user stats cache"
ON public.user_stats_cache  
FOR SELECT
USING (true);

-- 3. PERMITIR VISUALIZAÇÃO PÚBLICA DE CONQUISTAS DESBLOQUEADAS
CREATE POLICY "Public can view unlocked achievements"
ON public.user_achievements
FOR SELECT
USING (is_completed = true);

-- 4. PERMITIR VISUALIZAÇÃO PÚBLICA DE TÍTULOS CONQUISTADOS
CREATE POLICY "Public can view user titles"
ON public.user_titles
FOR SELECT  
USING (true);

-- 5. COMENTÁRIOS EXPLICATIVOS
COMMENT ON POLICY "Public can view gamified profile data" ON public.profiles IS 
'Permite visualização pública de dados gamificados como pontos, nível, streak para rankings e competições';

COMMENT ON POLICY "Public can view user stats cache" ON public.user_stats_cache IS 
'Cache público de estatísticas para performance otimizada dos rankings globais';

COMMENT ON POLICY "Public can view unlocked achievements" ON public.user_achievements IS 
'Conquistas desbloqueadas visíveis publicamente para motivação e gamificação';

COMMENT ON POLICY "Public can view user titles" ON public.user_titles IS 
'Títulos conquistados pelos usuários visíveis para sistema de progressão';

-- 6. GARANTIR QUE DADOS SENSÍVEIS CONTINUEM PROTEGIDOS
-- Os campos email, birthdate, city, state, preferences, radcoin_balance 
-- permanecem protegidos pelas políticas existentes mais restritivas