
-- Criar tabela para configurações do Tutor IA
CREATE TABLE public.ai_tutor_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_name TEXT NOT NULL,
  model_name TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  api_provider TEXT NOT NULL DEFAULT 'openai',
  prompt_template TEXT,
  max_tokens INTEGER NOT NULL DEFAULT 150,
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para logs de uso do Tutor IA
CREATE TABLE public.ai_tutor_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.ai_tutor_config(id),
  user_id UUID REFERENCES public.profiles(id),
  case_id UUID REFERENCES public.medical_cases(id),
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  response_time_ms INTEGER,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  prompt_used TEXT,
  response_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para planos de assinatura
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para sistema de conquistas
CREATE TABLE public.achievement_system (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  points_required INTEGER,
  conditions JSONB NOT NULL DEFAULT '{}',
  rewards JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para progresso das conquistas dos usuários
CREATE TABLE public.user_achievements_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  achievement_id UUID REFERENCES public.achievement_system(id) NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Criar tabela para roles administrativos dos usuários
CREATE TABLE public.admin_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  admin_role TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, admin_role)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.ai_tutor_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ai_tutor_config (apenas admins podem gerenciar)
CREATE POLICY "Admins can manage AI tutor configs"
  ON public.ai_tutor_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user_roles aur 
      WHERE aur.user_id = auth.uid() 
      AND aur.is_active = true
    )
  );

-- Políticas RLS para ai_tutor_usage_logs (usuários veem seus próprios logs, admins veem todos)
CREATE POLICY "Users can view their own AI tutor logs"
  ON public.ai_tutor_usage_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all AI tutor logs"
  ON public.ai_tutor_usage_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user_roles aur 
      WHERE aur.user_id = auth.uid() 
      AND aur.is_active = true
    )
  );

-- Políticas RLS para subscription_plans (todos podem ver, apenas admins podem modificar)
CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans"
  ON public.subscription_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user_roles aur 
      WHERE aur.user_id = auth.uid() 
      AND aur.is_active = true
    )
  );

-- Políticas RLS para achievement_system (todos podem ver, apenas admins podem modificar)
CREATE POLICY "Anyone can view achievements"
  ON public.achievement_system
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage achievements"
  ON public.achievement_system
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user_roles aur 
      WHERE aur.user_id = auth.uid() 
      AND aur.is_active = true
    )
  );

-- Políticas RLS para user_achievements_progress
CREATE POLICY "Users can view their own achievement progress"
  ON public.user_achievements_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all achievement progress"
  ON public.user_achievements_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user_roles aur 
      WHERE aur.user_id = auth.uid() 
      AND aur.is_active = true
    )
  );

-- Políticas RLS para admin_user_roles (apenas admins podem gerenciar)
CREATE POLICY "Admins can manage user roles"
  ON public.admin_user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user_roles aur 
      WHERE aur.user_id = auth.uid() 
      AND aur.is_active = true
    )
  );

-- Inserir alguns dados iniciais para planos de assinatura
INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, price_yearly, sort_order) VALUES
('free', 'Gratuito', 'Acesso básico à plataforma', 0.00, 0.00, 1),
('pro', 'Pro', 'Acesso completo com recursos avançados', 29.90, 299.00, 2),
('premium', 'Premium', 'Tudo do Pro + Tutor IA ilimitado', 59.90, 599.00, 3);

-- Inserir algumas conquistas iniciais
INSERT INTO public.achievement_system (code, name, description, rarity, conditions, rewards) VALUES
('first_case', 'Primeiro Caso', 'Resolva seu primeiro caso médico', 'common', '{"type": "cases_solved", "value": 1}', '{"radcoins": 50, "points": 10}'),
('streak_5', 'Sequência de 5', 'Acerte 5 casos seguidos', 'uncommon', '{"type": "streak", "value": 5}', '{"radcoins": 100, "points": 25}'),
('hundred_cases', 'Centenário', 'Resolva 100 casos médicos', 'rare', '{"type": "cases_solved", "value": 100}', '{"radcoins": 500, "points": 100}'),
('event_winner', 'Campeão', 'Vença seu primeiro evento', 'epic', '{"type": "events_won", "value": 1}', '{"radcoins": 1000, "points": 200}'),
('master_radiologist', 'Radiologista Master', 'Resolva 1000 casos com 95% de acertos', 'legendary', '{"type": "cases_solved", "value": 1000, "accuracy": 95}', '{"radcoins": 5000, "points": 1000}');
