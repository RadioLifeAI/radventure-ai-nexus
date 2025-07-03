-- Inserir desafio de teste para hoje
INSERT INTO public.daily_challenges (
  external_id,
  question,
  correct_answer,
  explanation,
  challenge_date,
  community_stats
) VALUES (
  'test-challenge-' || CURRENT_DATE::text,
  'A tomografia computadorizada utiliza radiação ionizante para produzir imagens?',
  true,
  'Verdadeiro. A tomografia computadorizada (TC) utiliza raios-X, que são uma forma de radiação ionizante, para criar imagens transversais detalhadas do corpo. Os raios-X são emitidos por um tubo que gira ao redor do paciente, e os detectores captam a radiação que atravessa o corpo, permitindo a reconstrução das imagens.',
  CURRENT_DATE,
  '{"total_responses": 0, "correct_responses": 0}'
)
ON CONFLICT (challenge_date) DO UPDATE SET
  question = EXCLUDED.question,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation,
  updated_at = NOW();