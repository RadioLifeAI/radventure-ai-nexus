-- CORREÇÃO DEFINITIVA: Ambiguidade current_streak nas funções de perfil

-- 1. CORRIGIR FUNÇÃO award_daily_login_bonus (principal causa do erro)
CREATE OR REPLACE FUNCTION public.award_daily_login_bonus(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  last_login_date date;
  user_current_streak integer;  -- Renomeado para evitar ambiguidade
  bonus_radcoins integer := 5;
  streak_bonus integer := 0;
  result jsonb;
BEGIN
  -- Buscar último login e streak atual com qualificação explícita
  SELECT 
    COALESCE((profiles.preferences->>'last_login_date')::date, CURRENT_DATE - 1),
    profiles.current_streak  -- Qualificação explícita da tabela
  INTO last_login_date, user_current_streak
  FROM public.profiles 
  WHERE profiles.id = p_user_id;
  
  -- Se não logou hoje ainda
  IF last_login_date < CURRENT_DATE THEN
    -- Calcular novo streak
    IF last_login_date = CURRENT_DATE - 1 THEN
      user_current_streak := user_current_streak + 1;
    ELSE
      user_current_streak := 1;
    END IF;
    
    -- Bonus por streak
    IF user_current_streak >= 7 THEN
      streak_bonus := 15;
    ELSIF user_current_streak >= 3 THEN
      streak_bonus := 5;
    END IF;
    
    -- Atualizar perfil com qualificação explícita
    UPDATE public.profiles 
    SET 
      current_streak = user_current_streak,  -- Sem ambiguidade
      preferences = COALESCE(preferences, '{}'::jsonb) || jsonb_build_object('last_login_date', CURRENT_DATE::text),
      updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Dar RadCoins
    PERFORM public.award_radcoins(
      p_user_id, 
      bonus_radcoins + streak_bonus, 
      'daily_login',
      jsonb_build_object('streak', user_current_streak, 'date', CURRENT_DATE)
    );
    
    result := jsonb_build_object(
      'awarded', true,
      'radcoins', bonus_radcoins + streak_bonus,
      'streak', user_current_streak,
      'message', CASE 
        WHEN streak_bonus > 0 THEN 'Bonus de streak: +' || streak_bonus || ' RadCoins!'
        ELSE 'Login diário: +' || bonus_radcoins || ' RadCoins!'
      END
    );
  ELSE
    result := jsonb_build_object('awarded', false, 'message', 'Já recebeu o bônus hoje!');
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CORRIGIR FUNÇÃO trigger_streak_notifications
CREATE OR REPLACE FUNCTION public.trigger_streak_notifications()
RETURNS trigger AS $$
BEGIN
  -- Notificar streaks importantes (7, 30, 100 dias)
  -- Qualificação explícita: NEW.current_streak (da tabela profiles)
  IF NEW.current_streak IN (7, 30, 100) AND 
     (OLD.current_streak IS NULL OR OLD.current_streak < NEW.current_streak) THEN
    
    INSERT INTO public.notifications (
      user_id, type, title, message, priority, action_url, action_label, metadata
    ) VALUES (
      NEW.id,  -- ID do usuário da tabela profiles
      'streak_milestone',
      CASE 
        WHEN NEW.current_streak = 7 THEN '🔥 Streak de 1 Semana!'
        WHEN NEW.current_streak = 30 THEN '🔥 Streak de 1 Mês!'
        WHEN NEW.current_streak = 100 THEN '🔥 Streak Centenário!'
      END,
      CASE 
        WHEN NEW.current_streak = 7 THEN 'Parabéns por manter o foco por 7 dias consecutivos!'
        WHEN NEW.current_streak = 30 THEN 'Incrível! 30 dias de dedicação aos estudos!'
        WHEN NEW.current_streak = 100 THEN 'Lendário! 100 dias de streak consecutivo!'
      END,
      'high',
      '/app/estatisticas',
      'Ver Estatísticas',
      jsonb_build_object('streak_days', NEW.current_streak)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CORRIGIR FUNÇÃO trigger_level_up_check para evitar futuros problemas
CREATE OR REPLACE FUNCTION public.trigger_level_up_check()
RETURNS trigger AS $$
BEGIN
  -- Só processar se os pontos aumentaram significativamente (pelo menos 1 ponto)
  -- Usar NEW.total_points e OLD.total_points para ser explícito
  IF NEW.total_points > OLD.total_points THEN
    PERFORM public.process_level_up(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. VERIFICAR FUNÇÃO process_level_up para garantir clareza
CREATE OR REPLACE FUNCTION public.process_level_up(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  user_points INTEGER;
  old_level INTEGER;
  new_level_data RECORD;
  level_up_occurred BOOLEAN := FALSE;
  result JSONB;
BEGIN
  -- Buscar pontos atuais e nível do usuário com qualificação explícita
  SELECT profiles.total_points, profiles.user_level 
  INTO user_points, old_level
  FROM public.profiles 
  WHERE profiles.id = p_user_id;
  
  -- Calcular novo nível
  SELECT * INTO new_level_data
  FROM public.calculate_user_level(user_points);
  
  -- Verificar se houve level up
  IF new_level_data.level > old_level THEN
    level_up_occurred := TRUE;
    
    -- Atualizar perfil com novo nível (qualificação explícita)
    UPDATE public.profiles
    SET user_level = new_level_data.level,
        current_xp = user_points,
        active_title = COALESCE(active_title, new_level_data.title),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Desbloquear título se disponível
    IF new_level_data.title IS NOT NULL THEN
      INSERT INTO public.user_titles (user_id, title, is_active)
      VALUES (p_user_id, new_level_data.title, active_title IS NULL)
      ON CONFLICT (user_id, title) DO NOTHING;
    END IF;
    
    -- Criar notificação de level up
    INSERT INTO public.notifications (
      user_id, type, title, message, priority, action_url, action_label, metadata
    ) VALUES (
      p_user_id,
      'level_up',
      '🆙 Level Up! Nível ' || new_level_data.level,
      'Parabéns! Você alcançou o nível ' || new_level_data.level || ' e desbloqueou o título "' || new_level_data.title || '"!',
      'high',
      '/app/dashboard',
      'Ver Progresso',
      jsonb_build_object(
        'new_level', new_level_data.level,
        'title_unlocked', new_level_data.title
      )
    );
  ELSE
    -- Apenas atualizar XP atual
    UPDATE public.profiles
    SET current_xp = user_points,
        updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
  
  -- Retornar resultado
  result := jsonb_build_object(
    'level_up_occurred', level_up_occurred,
    'old_level', old_level,
    'new_level', new_level_data.level,
    'title_unlocked', new_level_data.title,
    'progress_percentage', new_level_data.progress_percentage,
    'current_xp', user_points,
    'next_level_xp', new_level_data.next_level_xp
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. LOG da correção aplicada
INSERT INTO public.system_settings (key, value, updated_at)
VALUES ('current_streak_ambiguity_fix', jsonb_build_object(
  'timestamp', now(),
  'action', 'fixed_ambiguous_current_streak_references',
  'functions_corrected', ARRAY['award_daily_login_bonus', 'trigger_streak_notifications', 'trigger_level_up_check', 'process_level_up'],
  'issue', 'column reference current_streak was ambiguous',
  'solution', 'explicit table qualification and variable renaming'
), now())
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;