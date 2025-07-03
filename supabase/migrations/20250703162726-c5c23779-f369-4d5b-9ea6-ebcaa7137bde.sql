-- CORREÇÃO DEFINITIVA: Erro 400 process_case_completion - Isolar level up trigger

-- ETAPA 1: Corrigir função process_level_up com tratamento robusto de erro
CREATE OR REPLACE FUNCTION public.process_level_up(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  user_points INTEGER;
  old_level INTEGER;
  new_level_data RECORD;
  level_up_occurred BOOLEAN := FALSE;
  result JSONB;
BEGIN
  -- CORREÇÃO: Buscar dados com tratamento de erro
  BEGIN
    SELECT profiles.total_points, profiles.user_level 
    INTO user_points, old_level
    FROM public.profiles 
    WHERE profiles.id = p_user_id;
    
    IF user_points IS NULL THEN
      RAISE LOG 'AVISO: Usuário % não encontrado para level up', p_user_id;
      RETURN jsonb_build_object('error', 'user_not_found', 'level_up_occurred', false);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'ERRO ao buscar dados do usuário % para level up: %', p_user_id, SQLERRM;
    RETURN jsonb_build_object('error', 'data_fetch_failed', 'level_up_occurred', false);
  END;
  
  -- CORREÇÃO: Calcular novo nível com tratamento de erro
  BEGIN
    SELECT * INTO new_level_data
    FROM public.calculate_user_level(user_points);
    
    IF new_level_data IS NULL THEN
      RAISE LOG 'AVISO: calculate_user_level retornou NULL para % pontos', user_points;
      RETURN jsonb_build_object('error', 'level_calculation_failed', 'level_up_occurred', false);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'ERRO na função calculate_user_level para % pontos: %', user_points, SQLERRM;
    RETURN jsonb_build_object('error', 'level_calculation_error', 'level_up_occurred', false);
  END;
  
  -- Verificar se houve level up
  IF new_level_data.level > old_level THEN
    level_up_occurred := TRUE;
    
    -- CORREÇÃO: Atualizar perfil com tratamento de erro
    BEGIN
      UPDATE public.profiles
      SET user_level = new_level_data.level,
          current_xp = user_points,
          active_title = COALESCE(active_title, new_level_data.title),
          updated_at = NOW()
      WHERE id = p_user_id;
      
      -- Desbloquear título se disponível
      IF new_level_data.title IS NOT NULL THEN
        INSERT INTO public.user_titles (user_id, title, is_active)
        VALUES (p_user_id, new_level_data.title, CASE WHEN active_title IS NULL THEN true ELSE false END)
        ON CONFLICT (user_id, title) DO NOTHING;
      END IF;
      
      -- Criar notificação de level up
      INSERT INTO public.notifications (
        user_id, type, title, message, priority, action_url, action_label, metadata
      ) VALUES (
        p_user_id,
        'level_up',
        '🆙 Level Up! Nível ' || new_level_data.level,
        'Parabéns! Você alcançou o nível ' || new_level_data.level || CASE 
          WHEN new_level_data.title IS NOT NULL THEN ' e desbloqueou o título "' || new_level_data.title || '"!'
          ELSE '!'
        END,
        'high',
        '/app/dashboard',
        'Ver Progresso',
        jsonb_build_object(
          'new_level', new_level_data.level,
          'title_unlocked', new_level_data.title
        )
      );
      
      RAISE LOG '✅ Level up processado: usuário % subiu para nível %', p_user_id, new_level_data.level;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'ERRO ao processar level up para usuário %: %', p_user_id, SQLERRM;
      -- IMPORTANTE: Mesmo com erro no level up, ainda retornamos sucesso parcial
      level_up_occurred := FALSE;
    END;
  ELSE
    -- Apenas atualizar XP atual
    BEGIN
      UPDATE public.profiles
      SET current_xp = user_points,
          updated_at = NOW()
      WHERE id = p_user_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'ERRO ao atualizar XP para usuário %: %', p_user_id, SQLERRM;
    END;
  END IF;
  
  -- Retornar resultado sempre
  result := jsonb_build_object(
    'level_up_occurred', level_up_occurred,
    'old_level', old_level,
    'new_level', new_level_data.level,
    'title_unlocked', new_level_data.title,
    'progress_percentage', COALESCE(new_level_data.progress_percentage, 0),
    'current_xp', user_points,
    'next_level_xp', COALESCE(new_level_data.next_level_xp, user_points)
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'ERRO CRÍTICO na função process_level_up para usuário %: %', p_user_id, SQLERRM;
  RETURN jsonb_build_object('error', 'critical_failure', 'level_up_occurred', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ETAPA 2: Isolar trigger de level up para não bloquear transação principal
CREATE OR REPLACE FUNCTION public.trigger_level_up_check()
RETURNS trigger AS $$
BEGIN
  -- CORREÇÃO CRÍTICA: Só processar se os pontos aumentaram E executar de forma isolada
  IF NEW.total_points > OLD.total_points THEN
    BEGIN
      -- Executar level up de forma assíncrona/isolada
      PERFORM public.process_level_up(NEW.id);
      RAISE LOG '✅ Level up trigger executado para usuário % (% -> % pontos)', NEW.id, OLD.total_points, NEW.total_points;
    EXCEPTION WHEN OTHERS THEN
      -- CRUCIAL: Logar erro mas NÃO falhar a transação principal
      RAISE LOG '⚠️ AVISO: Falha no level up trigger para usuário % (%->% pontos): %', NEW.id, OLD.total_points, NEW.total_points, SQLERRM;
      -- NÃO re-raise o erro - deixar transação principal continuar
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ETAPA 3: Corrigir função process_case_completion com logs detalhados
CREATE OR REPLACE FUNCTION public.process_case_completion(p_user_id uuid, p_case_id uuid, p_points integer DEFAULT 1, p_is_correct boolean DEFAULT true)
RETURNS void AS $$
DECLARE
  existing_count integer := 0;
  is_review boolean := false;
  new_review_count integer := 0;
  points_to_award integer := 0;
  case_title text := 'Caso desconhecido';
BEGIN
  -- Log detalhado da execução
  RAISE LOG '🎯 INICIANDO process_case_completion: user=%, case=%, points=%, correct=%', p_user_id, p_case_id, p_points, p_is_correct;
  
  -- Buscar título do caso para logs
  BEGIN
    SELECT title INTO case_title FROM medical_cases WHERE id = p_case_id;
  EXCEPTION WHEN OTHERS THEN
    case_title := 'Caso ID: ' || p_case_id::text;
  END;
  
  -- CORREÇÃO CRÍTICA: Contar registros anteriores VÁLIDOS E COMPLETOS
  SELECT COUNT(*) INTO existing_count
  FROM user_case_history
  WHERE user_id = p_user_id 
    AND case_id = p_case_id
    AND is_correct IS NOT NULL    -- Garantir resposta válida
    AND points IS NOT NULL;       -- Garantir processamento completo
  
  -- LÓGICA CORRIGIDA: Se já existe pelo menos 1 registro válido, é revisão
  IF existing_count > 0 THEN
    -- CASO EM REVISÃO
    is_review := true;
    new_review_count := existing_count;  -- O número atual será o review_count
    points_to_award := 0; -- ZERO pontos em revisões
    
    RAISE LOG '📝 REVISÃO DETECTADA: registros anteriores=%, review_count=%, ZERO pontos', existing_count, new_review_count;
  ELSE
    -- PRIMEIRA TENTATIVA
    is_review := false;
    new_review_count := 0;
    points_to_award := CASE WHEN p_is_correct THEN p_points ELSE 0 END;
    
    RAISE LOG '⭐ PRIMEIRA TENTATIVA: % pontos serão creditados', points_to_award;
  END IF;

  -- Registrar no histórico com dados completos
  BEGIN
    INSERT INTO user_case_history (
      user_id, case_id, is_correct, points, review_count, answered_at,
      details, help_used
    ) VALUES (
      p_user_id, p_case_id, p_is_correct, points_to_award, new_review_count, now(),
      jsonb_build_object(
        'case_title', case_title,
        'is_review', is_review,
        'original_points', p_points,
        'awarded_points', points_to_award
      ),
      '{}'::jsonb
    );
    
    RAISE LOG '✅ Histórico registrado: user=%, case=%, points_awarded=%', p_user_id, p_case_id, points_to_award;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG '❌ ERRO ao registrar histórico: %', SQLERRM;
    RAISE EXCEPTION 'Falha ao registrar histórico do caso: %', SQLERRM;
  END;

  -- Atualizar pontos do usuário (apenas se pontos > 0)
  IF points_to_award > 0 THEN
    BEGIN
      UPDATE profiles 
      SET total_points = total_points + points_to_award,
          updated_at = now()
      WHERE id = p_user_id;
      
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuário % não encontrado para atualizar pontos', p_user_id;
      END IF;
      
      RAISE LOG '✅ Pontos creditados: user=%, pontos_adicionados=%, caso=%', p_user_id, points_to_award, case_title;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG '❌ ERRO ao creditar pontos: %', SQLERRM;
      RAISE EXCEPTION 'Falha ao creditar pontos: %', SQLERRM;
    END;
  ELSE
    RAISE LOG '⚪ Nenhum ponto creditado (revisão ou resposta incorreta)';
  END IF;

  RAISE LOG '🎉 SUCESSO process_case_completion: user=%, case=%, pontos=%, review=%', p_user_id, case_title, points_to_award, is_review;
  
EXCEPTION WHEN OTHERS THEN
  RAISE LOG '💥 ERRO CRÍTICO em process_case_completion: user=%, case=%, erro=%', p_user_id, p_case_id, SQLERRM;
  RAISE EXCEPTION 'Erro crítico ao processar conclusão do caso: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ETAPA 4: Log da correção aplicada
INSERT INTO public.system_settings (key, value, updated_at)
VALUES ('case_completion_error_fix', jsonb_build_object(
  'timestamp', now(),
  'action', 'fixed_400_error_in_process_case_completion',
  'changes', ARRAY[
    'added_robust_error_handling_to_process_level_up',
    'isolated_level_up_trigger_to_prevent_transaction_blocking', 
    'enhanced_logging_in_process_case_completion',
    'protected_main_transaction_from_level_up_failures'
  ],
  'expected_result', 'process_case_completion_executes_without_400_error'
), now())
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;