
-- Expandir tipos de notificação para cobrir todos os casos identificados
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'event_starting', 'achievement_unlocked', 'ranking_update', 'new_event', 'reminder',
  'case_completed', 'streak_milestone', 'radcoin_purchase', 'radcoin_reward', 
  'journey_completed', 'performance_milestone', 'social_mention', 'friend_activity',
  'learning_tip', 'weekly_summary', 'system_maintenance', 'feature_announcement',
  'subscription_expiring', 'subscription_renewed', 'level_up', 'badge_earned',
  'challenge_invitation', 'study_reminder', 'leaderboard_position', 'daily_bonus'
));

-- Expandir prioridades se necessário
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_priority_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_priority_check 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_type_priority 
ON public.notifications(type, priority);

CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Função para criar notificação em massa com filtros
CREATE OR REPLACE FUNCTION public.create_filtered_notification(
  p_type text,
  p_title text,
  p_message text,
  p_priority text DEFAULT 'medium',
  p_action_url text DEFAULT NULL,
  p_action_label text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}',
  p_user_filter jsonb DEFAULT '{}'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_count integer := 0;
  user_query text;
BEGIN
  -- Construir query baseada nos filtros
  user_query := 'SELECT id FROM public.profiles WHERE type = ''USER''';
  
  -- Adicionar filtros se especificados
  IF p_user_filter ? 'academic_stage' THEN
    user_query := user_query || ' AND academic_stage = ''' || (p_user_filter->>'academic_stage') || '''';
  END IF;
  
  IF p_user_filter ? 'medical_specialty' THEN
    user_query := user_query || ' AND medical_specialty = ''' || (p_user_filter->>'medical_specialty') || '''';
  END IF;
  
  IF p_user_filter ? 'min_points' THEN
    user_query := user_query || ' AND total_points >= ' || (p_user_filter->>'min_points')::integer;
  END IF;
  
  -- Executar inserção
  EXECUTE 'INSERT INTO public.notifications (user_id, type, title, message, priority, action_url, action_label, metadata)
    SELECT id, $1, $2, $3, $4, $5, $6, $7 FROM (' || user_query || ') users'
  USING p_type, p_title, p_message, p_priority, p_action_url, p_action_label, p_metadata;
  
  GET DIAGNOSTICS notification_count = ROW_COUNT;
  RETURN notification_count;
END;
$$;

-- Trigger para conquistas desbloqueadas
CREATE OR REPLACE FUNCTION public.trigger_achievement_notifications()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    INSERT INTO public.notifications (
      user_id, type, title, message, priority, action_url, action_label, metadata
    )
    SELECT 
      NEW.user_id,
      'achievement_unlocked',
      '🏆 Conquista Desbloqueada!',
      'Parabéns! Você desbloqueou: ' || ach.name,
      'high',
      '/app/conquistas',
      'Ver Conquistas',
      jsonb_build_object(
        'achievement_id', NEW.achievement_id,
        'achievement_name', ach.name,
        'points_awarded', COALESCE(ach.rewards->>'points', '0')::integer
      )
    FROM public.achievement_system ach
    WHERE ach.id = NEW.achievement_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER achievement_notification_trigger
  AFTER UPDATE ON public.user_achievements_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_achievement_notifications();

-- Trigger para marcos de RadCoins
CREATE OR REPLACE FUNCTION public.trigger_radcoin_milestone_notifications()
RETURNS TRIGGER AS $$
DECLARE
  milestone_reached integer;
  milestone_message text;
BEGIN
  -- Verificar marcos de RadCoins (1000, 5000, 10000, etc.)
  IF NEW.balance_after >= 1000 AND (OLD.balance_after IS NULL OR OLD.balance_after < 1000) THEN
    milestone_reached := 1000;
    milestone_message := 'Você alcançou 1.000 RadCoins! 🎉';
  ELSIF NEW.balance_after >= 5000 AND (OLD.balance_after IS NULL OR OLD.balance_after < 5000) THEN
    milestone_reached := 5000;
    milestone_message := 'Incrível! 5.000 RadCoins conquistados! 💎';
  ELSIF NEW.balance_after >= 10000 AND (OLD.balance_after IS NULL OR OLD.balance_after < 10000) THEN
    milestone_reached := 10000;
    milestone_message := 'Marco épico: 10.000 RadCoins! 👑';
  END IF;
  
  IF milestone_reached IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id, type, title, message, priority, action_url, action_label, metadata
    ) VALUES (
      NEW.user_id,
      'radcoin_reward',
      '💰 Marco de RadCoins!',
      milestone_message,
      'high',
      '/app/estatisticas',
      'Ver Progresso',
      jsonb_build_object('milestone', milestone_reached, 'balance', NEW.balance_after)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER radcoin_milestone_trigger
  AFTER INSERT ON public.radcoin_transactions_log
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_radcoin_milestone_notifications();

-- Trigger para streaks importantes
CREATE OR REPLACE FUNCTION public.trigger_streak_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar streaks importantes (7, 30, 100 dias)
  IF NEW.current_streak IN (7, 30, 100) AND 
     (OLD.current_streak IS NULL OR OLD.current_streak < NEW.current_streak) THEN
    
    INSERT INTO public.notifications (
      user_id, type, title, message, priority, action_url, action_label, metadata
    ) VALUES (
      NEW.id,
      'streak_milestone',
      CASE 
        WHEN NEW.current_streak = 7 THEN '🔥 Streak de 1 Semana!'
        WHEN NEW.current_streak = 30 THEN '🔥 Streak de 1 Mês!'
        WHEN NEW.current_streak = 100 THEN '🔥 Streak Centenário!'
      END,
      CASE 
        WHEN NEW.current_streak = 7 THEN 'Parabéns por manter o foco por 7 dias consecutivos!'
        WHEN NEW.current_streak = 30 THEN 'Incrível! 30 dias de dedicação aos estudos!'
        WHEN NEW.current_streak = 100 THEN 'Lendário! 100 dias de streak consecutivo!'
      END,
      'high',
      '/app/estatisticas',
      'Ver Estatísticas',
      jsonb_build_object('streak_days', NEW.current_streak)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER streak_notification_trigger
  AFTER UPDATE OF current_streak ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_streak_notifications();

-- Função para limpeza automática de notificações antigas
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Manter apenas notificações dos últimos 90 dias
  DELETE FROM public.notifications 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Log da limpeza
  RAISE NOTICE 'Notificações antigas removidas em %', NOW();
END;
$$;
