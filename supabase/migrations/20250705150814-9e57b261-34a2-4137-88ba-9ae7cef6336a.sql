-- Criar constraint apenas com tipos existentes + event_prize
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'event_starting', 'radcoin_reward', 'report_update', 'event_prize', 
  'achievement_unlocked', 'level_up', 'streak_milestone', 'daily_challenge', 
  'event_finished', 'system_update', 'welcome', 'admin_message', 'maintenance'
));