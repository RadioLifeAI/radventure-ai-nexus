-- CORREÇÃO DEFINITIVA: Simplificar sistema de level up removendo RadCoins
-- ETAPA 1: Remover coluna radcoin_reward da tabela user_levels (fonte da ambiguidade)
ALTER TABLE public.user_levels DROP COLUMN IF EXISTS radcoin_reward;

-- ETAPA 2: Recriar função process_level_up SEM RadCoins (só level + título + notificação)
CREATE OR REPLACE FUNCTION public.process_level_up(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_points INTEGER;
  old_level INTEGER;
  new_level_data RECORD;
  level_up_occurred BOOLEAN := FALSE;
  result JSONB;
BEGIN
  -- Buscar pontos atuais e nível do usuário
  SELECT total_points, user_level INTO user_points, old_level
  FROM public.profiles WHERE id = p_user_id;
  
  -- Calcular novo nível
  SELECT * INTO new_level_data
  FROM public.calculate_user_level(user_points);
  
  -- Verificar se houve level up
  IF new_level_data.level > old_level THEN
    level_up_occurred := TRUE;
    
    -- Atualizar perfil com novo nível
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
    
    -- Criar notificação de level up (SEM RadCoins)
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
$$;

-- ETAPA 3: Otimizar trigger para só executar em aumentos significativos de pontos
CREATE OR REPLACE FUNCTION public.trigger_level_up_check()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Só processar se os pontos aumentaram significativamente (pelo menos 1 ponto)
  IF NEW.total_points > OLD.total_points THEN
    PERFORM public.process_level_up(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- ETAPA 4: Atualizar dados da tabela user_levels sem radcoin_reward
UPDATE public.user_levels SET description = 
  CASE level
    WHEN 1 THEN 'Início da jornada radiológica'
    WHEN 2 THEN 'Primeiros passos na interpretação'
    WHEN 3 THEN 'Desenvolvendo o olhar clínico'
    WHEN 4 THEN 'Interpretação básica consolidada'
    WHEN 5 THEN 'Conhecimento em múltiplas modalidades'
    WHEN 6 THEN 'Diagnósticos precisos e confiáveis'
    WHEN 7 THEN 'Casos complexos dominados'
    WHEN 8 THEN 'Referência em interpretação'
    WHEN 9 THEN 'Conhecimento enciclopédico'
    WHEN 10 THEN 'O ápice da excelência radiológica'
  END;

-- ETAPA 5: Log de correção
INSERT INTO public.system_settings (key, value, updated_at)
VALUES (
  'level_system_fixed',
  jsonb_build_object(
    'fixed_at', now(),
    'changes', 'Removed RadCoin rewards from level up, fixed SQL ambiguity, simplified level progression'
  ),
  now()
)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;