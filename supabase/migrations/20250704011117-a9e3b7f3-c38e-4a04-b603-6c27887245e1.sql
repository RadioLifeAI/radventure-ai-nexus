-- Inserir um desafio de teste para hoje
INSERT INTO public.daily_challenges (question, correct_answer, explanation, challenge_date, external_id) 
VALUES (
  'A ressonância magnética (RM) é o método de imagem mais sensível para detectar edema cerebral.',
  true,
  'A ressonância magnética, especialmente as sequências FLAIR e T2, são extremamente sensíveis para detectar edema cerebral, sendo superiores à tomografia computadorizada na detecção precoce de alterações sutis no conteúdo de água cerebral.',
  CURRENT_DATE,
  'test-challenge-' || extract(epoch from now())::text
)
ON CONFLICT (challenge_date) DO UPDATE SET
  question = EXCLUDED.question,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation;