
-- Ativar triggers automáticos para as funções já existentes
-- Apenas criar os triggers que conectam as funções às tabelas

-- Trigger para conquistas (se não existir)
DROP TRIGGER IF EXISTS achievement_notification_trigger ON public.user_achievements_progress;
CREATE TRIGGER achievement_notification_trigger
  AFTER UPDATE ON public.user_achievements_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_achievement_notifications();

-- Trigger para marcos de RadCoins (se não existir)  
DROP TRIGGER IF EXISTS radcoin_milestone_trigger ON public.radcoin_transactions_log;
CREATE TRIGGER radcoin_milestone_trigger
  AFTER INSERT ON public.radcoin_transactions_log
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_radcoin_milestone_notifications();

-- Trigger para streaks de login (se não existir)
DROP TRIGGER IF EXISTS streak_notification_trigger ON public.profiles;
CREATE TRIGGER streak_notification_trigger
  AFTER UPDATE OF current_streak ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_streak_notifications();

-- Garantir que todos os tipos de notificação estão disponíveis
-- Adicionar tipos faltantes se não existirem
DO $$
BEGIN
    -- Verificar se os tipos existem e adicionar se necessário
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'radcoin_reward' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
    ) THEN
        -- Recriar constraint para incluir novos tipos
        ALTER TABLE public.notifications 
        DROP CONSTRAINT IF EXISTS notifications_type_check;
        
        ALTER TABLE public.notifications 
        ADD CONSTRAINT notifications_type_check 
        CHECK (type IN ('event_starting', 'achievement_unlocked', 'ranking_update', 'new_event', 'reminder', 'radcoin_reward', 'streak_milestone', 'daily_login_bonus', 'case_milestone'));
    END IF;
END $$;
