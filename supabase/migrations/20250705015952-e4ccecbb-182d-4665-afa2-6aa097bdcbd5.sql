-- CORREÇÕES CRÍTICAS PARA O MODAL DE DESAFIO DIÁRIO

-- 1. INSERIR DESAFIO PARA HOJE
INSERT INTO public.daily_challenges (
  external_id,
  question,
  correct_answer,
  explanation,
  challenge_date,
  community_stats
) VALUES (
  'challenge-2025-07-05',
  'A ultrassonografia Doppler é capaz de avaliar o fluxo sanguíneo em tempo real?',
  true,
  'Verdadeiro. A ultrassonografia Doppler utiliza o efeito Doppler para detectar o movimento do sangue nos vasos, permitindo a avaliação do fluxo sanguíneo em tempo real. Esta técnica é fundamental para avaliar a circulação arterial e venosa, detectar estenoses, tromboses e outras alterações vasculares.',
  CURRENT_DATE,
  '{"total_responses": 0, "correct_responses": 0}'
)
ON CONFLICT (challenge_date) DO UPDATE SET
  question = EXCLUDED.question,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation,
  updated_at = NOW();

-- 2. CORRIGIR FUNÇÃO get_daily_challenge_for_user COM VERIFICAÇÕES SEGURAS
CREATE OR REPLACE FUNCTION public.get_daily_challenge_for_user(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_challenge RECORD;
  user_challenge RECORD;
  result JSON;
BEGIN
  -- Log de debug
  RAISE LOG '🔍 DAILY CHALLENGE: Buscando desafio para usuário %', p_user_id;
  
  -- Buscar desafio de hoje
  SELECT * INTO today_challenge
  FROM public.daily_challenges
  WHERE challenge_date = CURRENT_DATE
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Se não há desafio de hoje, retornar null
  IF today_challenge IS NULL THEN
    RAISE LOG '❌ DAILY CHALLENGE: Nenhum desafio ativo encontrado para hoje';
    RETURN NULL;
  END IF;
  
  RAISE LOG '✅ DAILY CHALLENGE: Desafio encontrado - ID: %, Pergunta: "%"', 
    today_challenge.id, LEFT(today_challenge.question, 50);
  
  -- Verificar se usuário já respondeu hoje
  SELECT * INTO user_challenge
  FROM public.user_daily_challenges
  WHERE user_id = p_user_id
    AND challenge_id = today_challenge.id;
  
  -- CORREÇÃO CRÍTICA: Verificar NULL antes de acessar campos
  IF user_challenge IS NOT NULL AND user_challenge.answered = true THEN
    RAISE LOG '⚠️ DAILY CHALLENGE: Usuário já respondeu este desafio';
    RETURN NULL;
  END IF;
  
  -- Construir resultado
  result := json_build_object(
    'id', today_challenge.id,
    'question', today_challenge.question,
    'explanation', today_challenge.explanation,
    'community_stats', today_challenge.community_stats,
    'challenge_date', today_challenge.challenge_date
  );
  
  -- Criar registro se não existir
  IF user_challenge IS NULL THEN
    RAISE LOG '📝 DAILY CHALLENGE: Criando registro para usuário';
    INSERT INTO public.user_daily_challenges (user_id, challenge_id)
    VALUES (p_user_id, today_challenge.id);
  END IF;
  
  RAISE LOG '🎯 DAILY CHALLENGE: Retornando desafio para usuário';
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  RAISE LOG '❌ DAILY CHALLENGE ERRO: % - %', SQLSTATE, SQLERRM;
  RETURN NULL;
END;
$$;