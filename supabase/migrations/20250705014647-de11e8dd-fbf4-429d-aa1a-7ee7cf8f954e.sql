-- SISTEMA DE DISTRIBUIÇÃO AUTOMÁTICA DE PRÊMIOS DE EVENTOS

-- Função principal para distribuir prêmios de eventos
CREATE OR REPLACE FUNCTION public.distribute_event_prizes(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_data RECORD;
  prize_config jsonb;
  participant_count integer;
  prize_position integer;
  prize_amount integer;
  current_rank_data RECORD;
  distributed_count integer := 0;
  total_radcoins_distributed integer := 0;
  result jsonb;
BEGIN
  -- Verificar se evento já foi processado
  IF EXISTS (SELECT 1 FROM public.event_final_rankings WHERE event_id = p_event_id) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Event prizes already distributed',
      'event_id', p_event_id
    );
  END IF;
  
  -- Buscar dados do evento
  SELECT * INTO event_data
  FROM public.events
  WHERE id = p_event_id AND status = 'FINISHED';
  
  IF event_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Event not found or not finished',
      'event_id', p_event_id
    );
  END IF;
  
  -- Verificar se evento tem configuração de prêmios
  prize_config := event_data.prize_distribution;
  IF prize_config IS NULL OR jsonb_typeof(prize_config) != 'object' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No prize distribution configured',
      'event_id', p_event_id
    );
  END IF;
  
  -- Contar participantes
  SELECT COUNT(*) INTO participant_count
  FROM public.event_rankings
  WHERE event_id = p_event_id;
  
  IF participant_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No participants found',
      'event_id', p_event_id
    );
  END IF;
  
  -- Processar cada posição do ranking
  FOR current_rank_data IN
    SELECT er.user_id, er.rank, er.score, p.full_name, p.username
    FROM public.event_rankings er
    JOIN public.profiles p ON p.id = er.user_id
    WHERE er.event_id = p_event_id
    ORDER BY er.rank ASC
  LOOP
    prize_position := current_rank_data.rank;
    prize_amount := 0;
    
    -- Determinar prêmio baseado na configuração
    IF prize_config ? prize_position::text THEN
      prize_amount := (prize_config->>prize_position::text)::integer;
    ELSIF prize_config ? 'default' AND prize_position <= COALESCE((prize_config->>'max_positions')::integer, 10) THEN
      prize_amount := (prize_config->>'default')::integer;
    END IF;
    
    -- Distribuir prêmio se houver
    IF prize_amount > 0 THEN
      -- Dar RadCoins
      PERFORM public.award_radcoins(
        current_rank_data.user_id,
        prize_amount,
        'event_prize',
        jsonb_build_object(
          'event_id', p_event_id,
          'event_name', event_data.name,
          'final_rank', current_rank_data.rank,
          'final_score', current_rank_data.score,
          'participants_count', participant_count
        )
      );
      
      distributed_count := distributed_count + 1;
      total_radcoins_distributed := total_radcoins_distributed + prize_amount;
      
      -- Criar notificação de prêmio
      INSERT INTO public.notifications (
        user_id, type, title, message, priority, action_url, action_label, metadata
      ) VALUES (
        current_rank_data.user_id,
        'event_prize',
        '🏆 Prêmio do Evento!',
        'Parabéns! Você ficou em ' || current_rank_data.rank || 'º lugar no evento "' || event_data.name || '" e ganhou ' || prize_amount || ' RadCoins!',
        'high',
        '/app/evento/' || p_event_id || '/ranking',
        'Ver Ranking',
        jsonb_build_object(
          'event_id', p_event_id,
          'rank', current_rank_data.rank,
          'prize_radcoins', prize_amount
        )
      );
    END IF;
    
    -- Registrar ranking final
    INSERT INTO public.event_final_rankings (
      event_id, user_id, rank, radcoins_awarded
    ) VALUES (
      p_event_id, 
      current_rank_data.user_id, 
      current_rank_data.rank, 
      prize_amount
    );
  END LOOP;
  
  -- Criar notificação geral do evento finalizado
  INSERT INTO public.notifications (user_id, type, title, message, priority, action_url, action_label, metadata)
  SELECT 
    er.user_id,
    'event_finished',
    '🏁 Evento Finalizado',
    'O evento "' || event_data.name || '" foi finalizado! Confira o ranking final e os premiados.',
    'medium',
    '/app/evento/' || p_event_id || '/ranking',
    'Ver Ranking Final',
    jsonb_build_object('event_id', p_event_id)
  FROM public.event_rankings er
  WHERE er.event_id = p_event_id;
  
  -- Log da operação
  RAISE NOTICE '🏆 PRÊMIOS DISTRIBUÍDOS - Evento: % | Ganhadores: % | RadCoins: %', 
    event_data.name, distributed_count, total_radcoins_distributed;
  
  result := jsonb_build_object(
    'success', true,
    'event_id', p_event_id,
    'event_name', event_data.name,
    'total_participants', participant_count,
    'winners_count', distributed_count,
    'total_radcoins_distributed', total_radcoins_distributed,
    'processed_at', now()
  );
  
  RETURN result;
END;
$$;

-- Trigger para distribuição automática de prêmios
CREATE OR REPLACE FUNCTION public.trigger_event_prize_distribution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  distribution_result jsonb;
BEGIN
  -- Só processar quando evento muda para FINISHED
  IF NEW.status = 'FINISHED' AND (OLD.status IS NULL OR OLD.status != 'FINISHED') THEN
    
    -- Aguardar um pouco para garantir que todos os dados estão consistentes
    PERFORM pg_sleep(2);
    
    -- Executar distribuição de prêmios
    BEGIN
      SELECT public.distribute_event_prizes(NEW.id) INTO distribution_result;
      
      RAISE NOTICE '🎯 AUTO-DISTRIBUIÇÃO EXECUTADA: %', distribution_result;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG '❌ ERRO na distribuição automática do evento %: %', NEW.id, SQLERRM;
      -- Não falhar o trigger - apenas logar o erro
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela events
DROP TRIGGER IF EXISTS trigger_auto_distribute_prizes ON public.events;
CREATE TRIGGER trigger_auto_distribute_prizes
  AFTER UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_event_prize_distribution();

-- Função auxiliar para redistribuir prêmios manualmente (caso necessário)
CREATE OR REPLACE FUNCTION public.manual_event_prize_redistribution(p_event_id uuid, p_force boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Verificar permissão admin
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin access required');
  END IF;
  
  -- Se forçar, limpar distribuições anteriores
  IF p_force THEN
    DELETE FROM public.event_final_rankings WHERE event_id = p_event_id;
    RAISE NOTICE '🔄 Limpando distribuições anteriores do evento %', p_event_id;
  END IF;
  
  -- Executar distribuição
  SELECT public.distribute_event_prizes(p_event_id) INTO result;
  
  RETURN result;
END;
$$;

-- Função para obter estatísticas de prêmios de um evento
CREATE OR REPLACE FUNCTION public.get_event_prize_stats(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats jsonb;
  event_name text;
  total_radcoins integer;
  winners_count integer;
  total_participants integer;
BEGIN
  -- Buscar nome do evento
  SELECT name INTO event_name FROM public.events WHERE id = p_event_id;
  
  -- Calcular estatísticas
  SELECT 
    COUNT(*) as winners,
    COALESCE(SUM(radcoins_awarded), 0) as total_distributed
  INTO winners_count, total_radcoins
  FROM public.event_final_rankings
  WHERE event_id = p_event_id AND radcoins_awarded > 0;
  
  -- Total de participantes
  SELECT COUNT(*) INTO total_participants
  FROM public.event_rankings
  WHERE event_id = p_event_id;
  
  stats := jsonb_build_object(
    'event_id', p_event_id,
    'event_name', event_name,
    'total_participants', total_participants,
    'winners_count', winners_count,
    'total_radcoins_distributed', total_radcoins,
    'distribution_completed', winners_count > 0,
    'prize_percentage', CASE 
      WHEN total_participants > 0 THEN ROUND((winners_count::numeric / total_participants::numeric) * 100, 2)
      ELSE 0
    END
  );
  
  RETURN stats;
END;
$$;