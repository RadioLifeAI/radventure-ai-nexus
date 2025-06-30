
-- Criar tabela para reports de usuários
CREATE TABLE public.user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID,
  report_type TEXT NOT NULL CHECK (report_type IN ('error', 'content', 'technical', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'dismissed')),
  admin_response TEXT,
  admin_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX idx_user_reports_user_id ON public.user_reports(user_id);
CREATE INDEX idx_user_reports_status ON public.user_reports(status);
CREATE INDEX idx_user_reports_case_id ON public.user_reports(case_id);

-- RLS policies
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios reports
CREATE POLICY "Users can view their own reports" 
  ON public.user_reports 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Usuários podem criar seus próprios reports
CREATE POLICY "Users can create their own reports" 
  ON public.user_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todos os reports
CREATE POLICY "Admins can view all reports" 
  ON public.user_reports 
  FOR SELECT 
  USING (public.is_admin());

-- Admins podem atualizar todos os reports
CREATE POLICY "Admins can update all reports" 
  ON public.user_reports 
  FOR UPDATE 
  USING (public.is_admin());

-- Trigger para notificar mudanças de status nos reports
CREATE OR REPLACE FUNCTION public.trigger_report_status_notifications()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Notificar usuário quando status do report muda
  IF NEW.status != OLD.status THEN
    INSERT INTO public.notifications (
      user_id, type, title, message, priority, action_url, action_label, metadata
    ) VALUES (
      NEW.user_id,
      'report_update',
      CASE 
        WHEN NEW.status = 'in_progress' THEN '📋 Report em Análise'
        WHEN NEW.status = 'resolved' THEN '✅ Report Resolvido'
        WHEN NEW.status = 'dismissed' THEN '❌ Report Arquivado'
        ELSE '📋 Status do Report Atualizado'
      END,
      CASE 
        WHEN NEW.status = 'in_progress' THEN 'Seu report "' || NEW.title || '" está sendo analisado pela equipe.'
        WHEN NEW.status = 'resolved' THEN 'Seu report "' || NEW.title || '" foi resolvido!'
        WHEN NEW.status = 'dismissed' THEN 'Seu report "' || NEW.title || '" foi arquivado.'
        ELSE 'Status do seu report foi atualizado.'
      END,
      CASE 
        WHEN NEW.status = 'resolved' THEN 'high'
        ELSE 'medium'
      END,
      '/app/reports',
      'Ver Reports',
      jsonb_build_object('report_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para reports
CREATE TRIGGER report_status_notification_trigger
  AFTER UPDATE ON public.user_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_report_status_notifications();

-- Função para trigger de marcos de pontos
CREATE OR REPLACE FUNCTION public.trigger_points_milestone_notifications()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  milestone_reached integer;
  milestone_message text;
BEGIN
  -- Verificar marcos de pontos (1000, 5000, 10000)
  IF NEW.total_points >= 1000 AND (OLD.total_points IS NULL OR OLD.total_points < 1000) THEN
    milestone_reached := 1000;
    milestone_message := 'Parabéns! Você alcançou 1.000 pontos! 🌟';
  ELSIF NEW.total_points >= 5000 AND (OLD.total_points IS NULL OR OLD.total_points < 5000) THEN
    milestone_reached := 5000;
    milestone_message := 'Impressionante! 5.000 pontos conquistados! ⭐';
  ELSIF NEW.total_points >= 10000 AND (OLD.total_points IS NULL OR OLD.total_points < 10000) THEN
    milestone_reached := 10000;
    milestone_message := 'Épico! 10.000 pontos alcançados! 👑';
  END IF;
  
  IF milestone_reached IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id, type, title, message, priority, action_url, action_label, metadata
    ) VALUES (
      NEW.id,
      'points_milestone',
      '🎯 Marco de Pontos Alcançado!',
      milestone_message,
      'high',
      '/app/estatisticas',
      'Ver Estatísticas',
      jsonb_build_object('milestone', milestone_reached, 'total_points', NEW.total_points)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para marcos de pontos
CREATE TRIGGER points_milestone_trigger
  AFTER UPDATE OF total_points ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_points_milestone_notifications();

-- Atualizar constraint da tabela notifications para incluir novos tipos
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'event_starting', 'achievement_unlocked', 'ranking_update', 'new_event', 
  'reminder', 'radcoin_reward', 'streak_milestone', 'daily_login_bonus', 
  'case_milestone', 'report_update', 'points_milestone', 'first_achievement',
  'event_registration', 'first_event', 'first_purchase', 'admin_notice'
));
