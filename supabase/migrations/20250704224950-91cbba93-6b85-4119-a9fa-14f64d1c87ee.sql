-- CORREÇÃO CRÍTICA DE PERFORMANCE DOS RANKINGS - VERSÃO SIMPLIFICADA
-- Problema: Cache vazio causando queries pesadas desnecessárias

-- 1. POPULAR O CACHE DE ESTATÍSTICAS DE FORMA SIMPLIFICADA
INSERT INTO public.user_stats_cache (
  user_id, 
  total_cases, 
  correct_answers, 
  accuracy_percentage, 
  total_points, 
  radcoin_balance, 
  current_streak, 
  specialty_stats, 
  last_activity, 
  cache_updated_at
)
SELECT 
  p.id as user_id,
  COALESCE(stats.total_cases, 0) as total_cases,
  COALESCE(stats.correct_answers, 0) as correct_answers,
  CASE 
    WHEN COALESCE(stats.total_cases, 0) > 0 
    THEN ROUND((COALESCE(stats.correct_answers, 0) * 100.0 / stats.total_cases), 2)
    ELSE 0.0 
  END as accuracy_percentage,
  COALESCE(p.total_points, 0) as total_points,
  COALESCE(p.radcoin_balance, 0) as radcoin_balance,
  COALESCE(p.current_streak, 0) as current_streak,
  '{}'::jsonb as specialty_stats, -- Vamos popular isso depois
  stats.last_activity,
  NOW() as cache_updated_at
FROM public.profiles p
LEFT JOIN (
  SELECT 
    uch.user_id,
    COUNT(*) FILTER (WHERE COALESCE(uch.review_count, 0) = 0) as total_cases,
    COUNT(*) FILTER (WHERE uch.is_correct = true AND COALESCE(uch.review_count, 0) = 0) as correct_answers,
    MAX(uch.answered_at) as last_activity
  FROM public.user_case_history uch
  GROUP BY uch.user_id
) stats ON p.id = stats.user_id
ON CONFLICT (user_id) DO UPDATE SET
  total_cases = EXCLUDED.total_cases,
  correct_answers = EXCLUDED.correct_answers,
  accuracy_percentage = EXCLUDED.accuracy_percentage,
  total_points = EXCLUDED.total_points,
  radcoin_balance = EXCLUDED.radcoin_balance,
  current_streak = EXCLUDED.current_streak,
  last_activity = EXCLUDED.last_activity,
  cache_updated_at = NOW();

-- 2. CRIAR TRIGGER SIMPLIFICADO PARA ATUALIZAÇÃO AUTOMÁTICA DO CACHE
CREATE OR REPLACE FUNCTION public.update_user_stats_cache_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar cache quando user_case_history muda
  IF TG_TABLE_NAME = 'user_case_history' THEN
    PERFORM public.refresh_user_stats_cache(COALESCE(NEW.user_id, OLD.user_id));
  END IF;
  
  -- Atualizar cache quando profiles muda (pontos, streak, radcoins)
  IF TG_TABLE_NAME = 'profiles' THEN
    PERFORM public.refresh_user_stats_cache(COALESCE(NEW.id, OLD.id));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para user_case_history
DROP TRIGGER IF EXISTS trigger_update_stats_cache_on_case_history ON public.user_case_history;
CREATE TRIGGER trigger_update_stats_cache_on_case_history
  AFTER INSERT OR UPDATE OR DELETE ON public.user_case_history
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_cache_trigger();

-- Triggers para profiles
DROP TRIGGER IF EXISTS trigger_update_stats_cache_on_profiles ON public.profiles;
CREATE TRIGGER trigger_update_stats_cache_on_profiles
  AFTER UPDATE OF total_points, current_streak, radcoin_balance ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_cache_trigger();

-- 3. VERIFICAR RESULTADO
SELECT COUNT(*) as usuarios_no_cache FROM public.user_stats_cache;