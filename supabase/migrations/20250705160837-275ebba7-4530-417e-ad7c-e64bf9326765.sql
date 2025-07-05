-- FASE 2: CORREÇÃO CRÍTICA - REMOÇÃO DE TRIGGER DUPLICADO
-- Problema: 2 triggers ativos causando risco de distribuição dupla de prêmios

-- Remover trigger duplicado (manter apenas trigger_auto_distribute_prizes)
DROP TRIGGER IF EXISTS auto_distribute_event_prizes ON events;

-- Verificar que apenas o trigger correto permanece ativo
-- O trigger correto 'trigger_auto_distribute_prizes' deve permanecer
COMMENT ON TRIGGER trigger_auto_distribute_prizes ON events IS 
'Único trigger ativo para distribuição automática de prêmios - duplicata removida para evitar distribuição dupla';