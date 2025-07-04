-- CORREÇÃO CRÍTICA DE PERFORMANCE DOS RANKINGS
-- Problema: Cache vazio causando queries pesadas desnecessárias

-- 1. POPULAR O CACHE DE ESTATÍSTICAS AUTOMATICAMENTE
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
  COALESCE(ROUND((stats.correct_answers * 100.0 / NULLIF(stats.total_cases, 0)), 2), 0.0) as accuracy_percentage,
  COALESCE(p.total_points, 0) as total_points,
  COALESCE(p.radcoin_balance, 0) as radcoin_balance,
  COALESCE(p.current_streak, 0) as current_streak,
  COALESCE(stats.specialty_stats, '{}'::jsonb) as specialty_stats,
  stats.last_activity,
  NOW() as cache_updated_at
FROM public.profiles p
LEFT JOIN (
  SELECT 
    uch.user_id,
    COUNT(*) FILTER (WHERE (uch.review_count IS NULL OR uch.review_count = 0)) as total_cases,
    COUNT(*) FILTER (WHERE uch.is_correct = true AND (uch.review_count IS NULL OR uch.review_count = 0)) as correct_answers,
    MAX(uch.answered_at) as last_activity,
    jsonb_object_agg(
      COALESCE(mc.specialty, 'Outros'),
      jsonb_build_object(
        'total', COUNT(*) FILTER (WHERE (uch.review_count IS NULL OR uch.review_count = 0)),
        'correct', COUNT(*) FILTER (WHERE uch.is_correct = true AND (uch.review_count IS NULL OR uch.review_count = 0)),
        'points', COALESCE(SUM(uch.points) FILTER (WHERE (uch.review_count IS NULL OR uch.review_count = 0)), 0)
      )
    ) as specialty_stats
  FROM public.user_case_history uch
  LEFT JOIN public.medical_cases mc ON uch.case_id = mc.id
  GROUP BY uch.user_id
) stats ON p.id = stats.user_id
ON CONFLICT (user_id) DO UPDATE SET
  total_cases = EXCLUDED.total_cases,
  correct_answers = EXCLUDED.correct_answers,
  accuracy_percentage = EXCLUDED.accuracy_percentage,
  total_points = EXCLUDED.total_points,
  radcoin_balance = EXCLUDED.radcoin_balance,
  current_streak = EXCLUDED.current_streak,
  specialty_stats = EXCLUDED.specialty_stats,
  last_activity = EXCLUDED.last_activity,
  cache_updated_at = NOW();

-- 2. CRIAR TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DO CACHE
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

-- 3. LOG DE SUCESSO
SELECT 'Cache de estatísticas populado e triggers configurados com sucesso!' as status;