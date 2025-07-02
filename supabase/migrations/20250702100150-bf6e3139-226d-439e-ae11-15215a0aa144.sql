
-- FASE 2: IMPLEMENTAR PLANOS EDUCACIONAIS RADSUPORT
-- Remover planos genéricos atuais e criar planos educacionais

-- 1. Desativar planos atuais (não deletar para preservar dados)
UPDATE subscription_plans 
SET is_active = false, updated_at = now() 
WHERE is_active = true;

-- 2. Criar 3 planos educacionais RadSupport
INSERT INTO subscription_plans (
  name, 
  display_name, 
  description, 
  price_monthly, 
  price_yearly, 
  features, 
  limits, 
  sort_order,
  is_active
) VALUES
-- PLANO BRONZE - RadSupport 5
(
  'RadSupport 5',
  'RadSupport Bronze',
  'Apoie o projeto educacional e ganhe benefícios bronze para acelerar seus estudos',
  7.00,
  70.00,
  '{
    "colaborator_badge": "Colaborador Bronze",
    "elimination_aids": 5,
    "skip_aids": 2,
    "ai_tutor_credits": 7,
    "xp_multiplier": 1.1,
    "priority_support": true,
    "early_access": false
  }'::jsonb,
  '{
    "radcoins_monthly": 50,
    "max_cases_per_day": 50,
    "ai_interactions_per_day": 10
  }'::jsonb,
  1,
  true
),
-- PLANO PRATA - RadSupport 10  
(
  'RadSupport 10',
  'RadSupport Prata',
  'Apoie mais o projeto e ganhe benefícios prata com recursos avançados',
  12.00,
  120.00,
  '{
    "colaborator_badge": "Colaborador Prata",
    "elimination_aids": 8,
    "skip_aids": 4,
    "ai_tutor_credits": 15,
    "xp_multiplier": 1.2,
    "priority_support": true,
    "early_access": true,
    "exclusive_content": true
  }'::jsonb,
  '{
    "radcoins_monthly": 120,
    "max_cases_per_day": 100,
    "ai_interactions_per_day": 25
  }'::jsonb,
  2,
  true
),
-- PLANO OURO - RadSupport 15
(
  'RadSupport 15',
  'RadSupport Ouro',
  'Máximo apoio ao projeto educacional com benefícios ouro e acesso completo',
  18.00,
  180.00,
  '{
    "colaborator_badge": "Colaborador Ouro",
    "elimination_aids": 12,
    "skip_aids": 6,
    "ai_tutor_credits": 25,
    "xp_multiplier": 1.3,
    "priority_support": true,
    "early_access": true,
    "exclusive_content": true,
    "unlimited_access": true
  }'::jsonb,
  '{
    "radcoins_monthly": 200,
    "max_cases_per_day": -1,
    "ai_interactions_per_day": -1
  }'::jsonb,
  3,
  true
);

-- 3. Adicionar configuração subscriptions_enabled na loja RadCoin
INSERT INTO radcoin_store_config (key, value, description, is_public) VALUES
(
  'subscriptions_enabled', 
  'true', 
  'Se as assinaturas educacionais estão habilitadas na loja', 
  true
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- 4. Atualizar configuração de anúncio da loja para promover planos educacionais
UPDATE radcoin_store_config 
SET value = '{
  "title": "🎓 Apoie a Educação Médica!",
  "message": "Contribua com o projeto educacional RadVenture e ganhe benefícios exclusivos! Novos planos RadSupport disponíveis."
}'::jsonb,
updated_at = now()
WHERE key = 'store_announcement';

-- 5. Criar função para sincronizar benefícios de assinatura
CREATE OR REPLACE FUNCTION sync_subscription_benefits(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_subscription RECORD;
  badge_text TEXT;
BEGIN
  -- Buscar assinatura ativa do usuário
  SELECT s.*, sp.features, sp.limits, sp.display_name
  INTO user_subscription
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = p_user_id 
    AND s.status = 'active'
    AND sp.is_active = true
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF user_subscription IS NOT NULL THEN
    -- Extrair selo de colaborador
    badge_text := user_subscription.features->>'colaborator_badge';
    
    -- Atualizar título ativo do usuário com o selo
    UPDATE profiles 
    SET active_title = badge_text,
        updated_at = now()
    WHERE id = p_user_id;
    
    -- Adicionar RadCoins mensais (se configurado)
    IF (user_subscription.limits->>'radcoins_monthly')::integer > 0 THEN
      PERFORM award_radcoins(
        p_user_id,
        (user_subscription.limits->>'radcoins_monthly')::integer,
        'subscription_monthly',
        jsonb_build_object('plan', user_subscription.display_name)
      );
    END IF;
    
    -- Atualizar ajudas do usuário com benefícios da assinatura
    UPDATE user_help_aids
    SET 
      elimination_aids = GREATEST(
        elimination_aids, 
        (user_subscription.features->>'elimination_aids')::integer
      ),
      skip_aids = GREATEST(
        skip_aids,
        (user_subscription.features->>'skip_aids')::integer  
      ),
      ai_tutor_credits = GREATEST(
        ai_tutor_credits,
        (user_subscription.features->>'ai_tutor_credits')::integer
      ),
      updated_at = now()
    WHERE user_id = p_user_id;
    
  ELSE
    -- Remover selo se não tem assinatura ativa
    UPDATE profiles 
    SET active_title = CASE 
      WHEN active_title LIKE '%Colaborador%' THEN NULL
      ELSE active_title
    END,
    updated_at = now()
    WHERE id = p_user_id;
  END IF;
END;
$$;

-- 6. Trigger para sincronizar benefícios quando assinatura muda
CREATE OR REPLACE FUNCTION trigger_subscription_benefits_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Sincronizar benefícios quando status da assinatura muda
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    PERFORM sync_subscription_benefits(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger na tabela subscriptions
DROP TRIGGER IF EXISTS subscription_benefits_sync_trigger ON subscriptions;
CREATE TRIGGER subscription_benefits_sync_trigger
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION trigger_subscription_benefits_sync();

-- 7. Atualizar store_enabled para garantir que a loja está ativa
UPDATE radcoin_store_config 
SET value = 'true'::jsonb,
    updated_at = now()
WHERE key = 'store_enabled';
