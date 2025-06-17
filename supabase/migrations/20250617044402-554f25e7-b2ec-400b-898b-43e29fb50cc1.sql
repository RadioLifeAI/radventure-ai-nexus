
-- Criar tabela para rastrear ajudas disponíveis por usuário
CREATE TABLE IF NOT EXISTS public.user_help_aids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  elimination_aids INTEGER NOT NULL DEFAULT 3,
  skip_aids INTEGER NOT NULL DEFAULT 1,
  ai_tutor_credits INTEGER NOT NULL DEFAULT 2,
  last_refill_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_help_aids_user_id ON public.user_help_aids(user_id);

-- Habilitar RLS
ALTER TABLE public.user_help_aids ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios registros
CREATE POLICY "Users can view own help aids" ON public.user_help_aids
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own help aids" ON public.user_help_aids
  FOR UPDATE USING (auth.uid() = user_id);

-- Função para inicializar ajudas para novos usuários
CREATE OR REPLACE FUNCTION public.initialize_user_help_aids()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_help_aids (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar ajudas automaticamente para novos usuários
DROP TRIGGER IF EXISTS on_user_created_init_help_aids ON auth.users;
CREATE TRIGGER on_user_created_init_help_aids
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_help_aids();

-- Função para consumir ajudas
CREATE OR REPLACE FUNCTION public.consume_help_aid(
  p_user_id UUID,
  p_aid_type TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  current_amount INTEGER;
BEGIN
  -- Verificar quantidade disponível
  CASE p_aid_type
    WHEN 'elimination' THEN
      SELECT elimination_aids INTO current_amount 
      FROM public.user_help_aids 
      WHERE user_id = p_user_id;
    WHEN 'skip' THEN
      SELECT skip_aids INTO current_amount 
      FROM public.user_help_aids 
      WHERE user_id = p_user_id;
    WHEN 'ai_tutor' THEN
      SELECT ai_tutor_credits INTO current_amount 
      FROM public.user_help_aids 
      WHERE user_id = p_user_id;
    ELSE
      RETURN FALSE;
  END CASE;

  -- Verificar se tem quantidade suficiente
  IF current_amount IS NULL OR current_amount < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Consumir a ajuda
  CASE p_aid_type
    WHEN 'elimination' THEN
      UPDATE public.user_help_aids 
      SET elimination_aids = elimination_aids - p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'skip' THEN
      UPDATE public.user_help_aids 
      SET skip_aids = skip_aids - p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'ai_tutor' THEN
      UPDATE public.user_help_aids 
      SET ai_tutor_credits = ai_tutor_credits - p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar campos para rastrear uso de ajudas no histórico de casos
ALTER TABLE public.user_case_history 
ADD COLUMN IF NOT EXISTS help_used JSONB DEFAULT '{}';

-- Função para recarregar ajudas diariamente (pode ser chamada por cron job)
CREATE OR REPLACE FUNCTION public.refill_daily_help_aids()
RETURNS INTEGER AS $$
DECLARE
  refilled_count INTEGER := 0;
BEGIN
  UPDATE public.user_help_aids 
  SET 
    elimination_aids = GREATEST(elimination_aids, 3),
    skip_aids = GREATEST(skip_aids, 1),
    ai_tutor_credits = GREATEST(ai_tutor_credits, 2),
    last_refill_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE last_refill_date < CURRENT_DATE;
  
  GET DIAGNOSTICS refilled_count = ROW_COUNT;
  RETURN refilled_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
