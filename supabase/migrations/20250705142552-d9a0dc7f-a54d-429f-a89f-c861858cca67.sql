-- PLANO DEFINITIVO: CORREÇÃO COMPLETA DO SISTEMA DE EVENTOS
-- FASE 1: Correção crítica do sistema de prêmios

-- 1. Adicionar 'event_prize' ao enum radcoin_tx_type
ALTER TYPE radcoin_tx_type ADD VALUE IF NOT EXISTS 'event_prize';

-- 2. Corrigir função distribute_event_prizes (remover referências a colunas inexistentes)
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
  -- Log início da distribuição
  RAISE NOTICE '🏆 INICIANDO DISTRIBUIÇÃO DE PRÊMIOS - Evento: %', p_event_id;
  
  -- Verificar se evento já foi processado
  IF EXISTS (SELECT 1 FROM public.event_final_rankings WHERE event_id = p_event_id) THEN
    RAISE NOTICE '⚠️ Evento % já teve prêmios distribuídos', p_event_id;
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
    RAISE NOTICE '❌ Evento % não encontrado ou não finalizado', p_event_id;
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Event not found or not finished',
      'event_id', p_event_id
    );
  END IF;
  
  -- Verificar se evento tem configuração de prêmios
  prize_config := event_data.prize_distribution;
  IF prize_config IS NULL OR jsonb_typeof(prize_config) != 'object' THEN
    RAISE NOTICE '⚠️ Evento % sem configuração de prêmios', p_event_id;
    -- Configuração padrão de prêmios
    prize_config := jsonb_build_object(
      '1', 100,  -- 1º lugar: 100 RadCoins
      '2', 50,   -- 2º lugar: 50 RadCoins  
      '3', 25,   -- 3º lugar: 25 RadCoins
      'default', 10,  -- 4º-10º lugar: 10 RadCoins cada
      'max_positions', 10
    );
  END IF;
  
  -- Contar participantes
  SELECT COUNT(*) INTO participant_count
  FROM public.event_rankings
  WHERE event_id = p_event_id;
  
  IF participant_count = 0 THEN
    RAISE NOTICE '❌ Nenhum participante encontrado para evento %', p_event_id;
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No participants found',
      'event_id', p_event_id
    );
  END IF;
  
  RAISE NOTICE '📊 Evento %: % participantes, iniciando distribuição...', event_data.name, participant_count;
  
  -- Processar cada posição do ranking (CORREÇÃO: remover referência a created_at)
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
      -- CORREÇÃO: Usar o novo tipo 'event_prize'
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
      
      RAISE NOTICE '💰 Prêmio distribuído: %º lugar = % RadCoins para %', 
        current_rank_data.rank, prize_amount, COALESCE(current_rank_data.full_name, current_rank_data.username);
      
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
  
  -- Log final da operação
  RAISE NOTICE '🎉 DISTRIBUIÇÃO CONCLUÍDA - Evento: % | Ganhadores: % | RadCoins: %', 
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