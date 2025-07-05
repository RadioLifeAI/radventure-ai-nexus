-- CORREÇÃO FINAL: Permitir tipo 'event_prize' nas notificações
-- Primeiro, verificar constraint atual
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%notifications_type%';

-- Remover constraint antiga
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Criar nova constraint incluindo 'event_prize'
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'achievement_unlocked', 'level_up', 'streak_milestone', 'daily_challenge', 
  'event_starting', 'event_finished', 'event_prize', 'system_update'
));