-- Criar constraint com todos os tipos existentes + event_prize
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Nova constraint incluindo todos os tipos encontrados
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'achievement_unlocked', 'level_up', 'streak_milestone', 'daily_challenge', 
  'event_starting', 'event_finished', 'event_prize', 'system_update',
  'welcome', 'admin_message', 'maintenance'
));