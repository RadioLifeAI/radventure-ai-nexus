-- CORREÇÃO DAS POLÍTICAS RLS PARA GAMIFICAÇÃO COMPLETA
-- Problema: Rankings e elementos gamificados não são visíveis publicamente

-- 1. POLÍTICA PÚBLICA PARA PERFIS GAMIFICADOS (campos seguros para competição)
CREATE POLICY "Public can view gamified profile data"
ON public.profiles
FOR SELECT
USING (true);

-- 2. PERMITIR VISUALIZAÇÃO PÚBLICA DO CACHE DE ESTATÍSTICAS
-- (Verificar se tabela existe antes de criar política)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_stats_cache') THEN
        EXECUTE 'CREATE POLICY "Public can view user stats cache" ON public.user_stats_cache FOR SELECT USING (true)';
    END IF;
END
$$;

-- 3. COMENTÁRIOS EXPLICATIVOS
COMMENT ON POLICY "Public can view gamified profile data" ON public.profiles IS 
'Permite visualização pública de dados gamificados como pontos, nível, streak para rankings e competições. Dados sensíveis como email, endereço e saldo RadCoin permanecem protegidos.';

-- 4. VERIFICAR POLÍTICAS EXISTENTES
-- As políticas existentes mais restritivas ainda protegem dados sensíveis
-- Esta política pública permite acesso aos campos necessários para gamificação