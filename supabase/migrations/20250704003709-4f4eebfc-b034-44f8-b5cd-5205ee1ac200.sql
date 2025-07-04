-- Inserir desafio de teste para hoje
INSERT INTO public.daily_challenges (
  external_id,
  question,
  correct_answer,
  explanation,
  challenge_date,
  community_stats
) VALUES (
  'challenge-' || CURRENT_DATE::text,
  'A ressonância magnética utiliza radiação ionizante para produzir imagens?',
  false,
  'Falso. A ressonância magnética (RM) utiliza campos magnéticos e ondas de radiofrequência, que são formas de radiação não-ionizante. Ao contrário da tomografia computadorizada e dos raios-X, a RM não expõe o paciente à radiação ionizante, sendo considerada mais segura nesse aspecto.',
  CURRENT_DATE,
  '{"total_responses": 0, "correct_responses": 0}'
)
ON CONFLICT (challenge_date) DO UPDATE SET
  question = EXCLUDED.question,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation,
  updated_at = NOW();