-- Criar achievement para streak do Desafio do Dia
INSERT INTO public.achievement_system (
  code,
  name,
  description,
  icon_url,
  rarity,
  is_active,
  rewards,
  conditions,
  points_required
) VALUES (
  'daily_challenge_streak_7',
  'Desafio do Dia - 7 Dias',
  'Complete o Desafio do Dia por 7 dias consecutivos',
  '/icons/trophy-daily.svg',
  'uncommon',
  true,
  '{"radcoins": 50, "title": "Disciplinado"}',
  '{"type": "daily_challenge_streak", "streak_days": 7}',
  null
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  rewards = EXCLUDED.rewards,
  conditions = EXCLUDED.conditions,
  updated_at = NOW();

-- Função para verificar streak do desafio diário
CREATE OR REPLACE FUNCTION public.check_daily_challenge_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE;
  has_challenge BOOLEAN;
BEGIN
  -- Começar de hoje e voltar no tempo
  check_date := CURRENT_DATE;
  
  LOOP
    -- Verificar se usuário respondeu desafio nesta data
    SELECT EXISTS(
      SELECT 1 
      FROM public.user_daily_challenges udc
      JOIN public.daily_challenges dc ON udc.challenge_id = dc.id
      WHERE udc.user_id = p_user_id
        AND udc.answered = true
        AND dc.challenge_date = check_date
    ) INTO has_challenge;
    
    -- Se não respondeu, quebrar o streak
    IF NOT has_challenge THEN
      EXIT;
    END IF;
    
    -- Incrementar streak e ir para dia anterior
    current_streak := current_streak + 1;
    check_date := check_date - INTERVAL '1 day';
    
    -- Limitar busca a 100 dias para performance
    IF current_streak >= 100 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN current_streak;
END;
$$;

-- Trigger para verificar achievements de streak após responder desafio
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

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_daily_challenge_achievements ON public.user_daily_challenges;
CREATE TRIGGER trigger_daily_challenge_achievements
  AFTER UPDATE ON public.user_daily_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_daily_challenge_achievements();