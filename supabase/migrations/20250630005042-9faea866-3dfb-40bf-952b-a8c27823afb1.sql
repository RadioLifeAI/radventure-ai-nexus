
-- FASE 1: Correção da Constraint do Sistema de Reports
-- Atualizar constraint para permitir todos os tipos de report implementados

ALTER TABLE public.user_reports 
DROP CONSTRAINT IF EXISTS user_reports_report_type_check;

ALTER TABLE public.user_reports 
ADD CONSTRAINT user_reports_report_type_check 
CHECK (report_type IN (
  'content_error',
  'technical_issue', 
  'inappropriate_content',
  'suggestion',
  'other'
));

-- Verificar se existem dados com tipos inválidos (opcional - para debug)
-- SELECT DISTINCT report_type FROM public.user_reports WHERE report_type NOT IN ('content_error', 'technical_issue', 'inappropriate_content', 'suggestion', 'other');
