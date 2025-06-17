
-- Criar tabela para jornadas de usuários
CREATE TABLE public.user_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  objectives JSONB DEFAULT '[]'::jsonb,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  case_ids JSONB DEFAULT '[]'::jsonb,
  current_case_index INTEGER DEFAULT 0,
  total_cases INTEGER DEFAULT 0,
  completed_cases INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  progress_percentage NUMERIC DEFAULT 0,
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'in_progress', 'completed', 'paused'))
);

-- Habilitar RLS
ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own journeys" 
  ON public.user_journeys 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journeys" 
  ON public.user_journeys 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journeys" 
  ON public.user_journeys 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journeys" 
  ON public.user_journeys 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_journeys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_journeys_updated_at
  BEFORE UPDATE ON public.user_journeys
  FOR EACH ROW
  EXECUTE FUNCTION update_user_journeys_updated_at();
