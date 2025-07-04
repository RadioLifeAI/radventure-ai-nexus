-- Recriar trigger que foi perdido na recriação da tabela
CREATE OR REPLACE FUNCTION public.trigger_daily_challenge_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_streak INTEGER;
BEGIN
  -- Só processar quando resposta é marcada como respondida
  IF NEW.answered = true AND (OLD.answered IS NULL OR OLD.answered = false) THEN
    
    -- Calcular streak atual
    user_streak := public.check_daily_challenge_streak(NEW.user_id);
    
    -- Verificar achievement de 7 dias
    IF user_streak >= 7 THEN
      -- Inserir ou atualizar progresso do achievement
      INSERT INTO public.user_achievements_progress (
        user_id, achievement_id, current_progress, is_completed, completed_at
      )
      SELECT 
        NEW.user_id,
        ach.id,
        user_streak,
        true,
        NOW()
      FROM public.achievement_system ach
      WHERE ach.code = 'daily_challenge_streak_7'
        AND ach.is_active = true
      ON CONFLICT (user_id, achievement_id) DO UPDATE SET
        current_progress = GREATEST(user_achievements_progress.current_progress, user_streak),
        is_completed = true,
        completed_at = COALESCE(user_achievements_progress.completed_at, NOW()),
        updated_at = NOW();
    END IF;
    
    -- Log do streak para debugging
    RAISE LOG 'Daily challenge streak para usuário %: % dias', NEW.user_id, user_streak;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER trigger_daily_challenge_achievements
  AFTER UPDATE ON public.user_daily_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_daily_challenge_achievements();