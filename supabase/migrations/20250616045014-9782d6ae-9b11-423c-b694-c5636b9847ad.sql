
-- Criar tabela para benefícios de usuário (controle fino de permissões por usuário)
CREATE TABLE public.user_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ai_credits INTEGER NOT NULL DEFAULT 0,
  elimination_aids INTEGER NOT NULL DEFAULT 0,
  skip_aids INTEGER NOT NULL DEFAULT 0,
  max_ai_hints_per_day INTEGER NOT NULL DEFAULT 3,
  max_eliminations_per_case INTEGER NOT NULL DEFAULT 2,
  max_skips_per_session INTEGER NOT NULL DEFAULT 5,
  bonus_points_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  has_premium_features BOOLEAN NOT NULL DEFAULT false,
  custom_title TEXT,
  badge_collection JSONB DEFAULT '[]'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Criar tabela para títulos e badges disponíveis
CREATE TABLE public.user_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  rarity TEXT NOT NULL DEFAULT 'common',
  unlock_criteria JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de assinaturas
CREATE TABLE public.subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'BRL',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela de assinaturas para melhor integração com Stripe
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.subscription_plans(id),
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Criar tabela para configurações do sistema
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category, key)
);

-- Inserir configurações padrão do app
INSERT INTO public.app_settings (category, key, value, description, is_public) VALUES
('app', 'name', '"RadiologyQuest"', 'Nome do aplicativo', true),
('app', 'tagline', '"Domine a Radiologia com IA"', 'Slogan do app', true),
('app', 'theme_color', '"#0891b2"', 'Cor principal do tema', true),
('gamification', 'daily_streak_bonus', '10', 'Bonus de pontos por streak diário', false),
('gamification', 'perfect_score_multiplier', '2.0', 'Multiplicador para pontuação perfeita', false),
('ai_tutor', 'default_credits_free', '5', 'Créditos IA padrão para usuários free', false),
('ai_tutor', 'default_credits_pro', '50', 'Créditos IA padrão para usuários pro', false),
('ai_tutor', 'default_credits_plus', '200', 'Créditos IA padrão para usuários plus', false)
ON CONFLICT (category, key) DO NOTHING;

-- Inserir alguns títulos padrão
INSERT INTO public.user_titles (code, display_name, description, rarity) VALUES
('novice_radiologist', 'Radiologista Novato', 'Primeiro passo na jornada radiológica', 'common'),
('case_master', 'Mestre dos Casos', 'Resolveu 100 casos com sucesso', 'rare'),
('streak_champion', 'Campeão de Sequência', 'Manteve streak de 30 dias', 'epic'),
('ai_whisperer', 'Sussurrador de IA', 'Especialista em usar o tutor IA', 'rare'),
('perfectionist', 'Perfeccionista', 'Acertou 50 casos seguidos sem erro', 'legendary')
ON CONFLICT (code) DO NOTHING;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_benefits
CREATE POLICY "Users can view their own benefits" ON public.user_benefits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all benefits" ON public.user_benefits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_user_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Políticas RLS para user_titles (públicas para leitura)
CREATE POLICY "Anyone can view titles" ON public.user_titles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage titles" ON public.user_titles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_user_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Políticas RLS para subscription_history
CREATE POLICY "Users can view their own subscription history" ON public.subscription_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscription history" ON public.subscription_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_user_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Políticas RLS para app_settings
CREATE POLICY "Anyone can view public settings" ON public.app_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all settings" ON public.app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_user_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Função para sincronizar benefícios baseado no plano de assinatura
CREATE OR REPLACE FUNCTION public.sync_user_benefits(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_tier TEXT;
  ai_credits_amount INTEGER := 5;
  elimination_aids_amount INTEGER := 3;
  skip_aids_amount INTEGER := 5;
  premium_features BOOLEAN := false;
BEGIN
  -- Buscar tier atual do usuário
  SELECT tier INTO current_tier 
  FROM public.subscriptions 
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Definir benefícios baseado no tier
  CASE COALESCE(current_tier, 'Free')
    WHEN 'Pro' THEN
      ai_credits_amount := 50;
      elimination_aids_amount := 10;
      skip_aids_amount := 15;
      premium_features := true;
    WHEN 'Plus' THEN
      ai_credits_amount := 200;
      elimination_aids_amount := 25;
      skip_aids_amount := 30;
      premium_features := true;
    ELSE -- Free
      ai_credits_amount := 5;
      elimination_aids_amount := 3;
      skip_aids_amount := 5;
      premium_features := false;
  END CASE;
  
  -- Atualizar ou inserir benefícios
  INSERT INTO public.user_benefits (
    user_id, ai_credits, elimination_aids, skip_aids, has_premium_features, updated_at
  ) VALUES (
    p_user_id, ai_credits_amount, elimination_aids_amount, skip_aids_amount, premium_features, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    ai_credits = EXCLUDED.ai_credits,
    elimination_aids = EXCLUDED.elimination_aids,
    skip_aids = EXCLUDED.skip_aids,
    has_premium_features = EXCLUDED.has_premium_features,
    updated_at = now();
END;
$$;

-- Trigger para sincronizar benefícios automaticamente quando assinatura muda
CREATE OR REPLACE FUNCTION public.trigger_sync_benefits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.sync_user_benefits(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_benefits_on_subscription_change
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sync_benefits();
