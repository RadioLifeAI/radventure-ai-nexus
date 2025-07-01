-- Adicionar novos tipos de transação ao enum
ALTER TYPE radcoin_tx_type ADD VALUE IF NOT EXISTS 'store_purchase';
ALTER TYPE radcoin_tx_type ADD VALUE IF NOT EXISTS 'store_welcome_bonus';

-- FASE 2: Inserir dados iniciais (corrigido)

-- Inserir produtos base (migrando dos dados mockados)
INSERT INTO public.radcoin_products (name, description, category, price, benefits, is_popular, discount_percentage, sort_order) VALUES
('Pacote Básico', 'Ajudas essenciais para começar', 'help_package', 100, 
 '{"elimination_aids": 10, "skip_aids": 5, "ai_tutor_credits": 3}', false, 0, 1),
('Pacote Avançado', 'Mais ajudas para acelerar seu progresso', 'help_package', 250, 
 '{"elimination_aids": 30, "skip_aids": 15, "ai_tutor_credits": 10}', true, 20, 2),
('Pacote Premium', 'Tudo que você precisa para dominar', 'help_package', 500, 
 '{"elimination_aids": 75, "skip_aids": 40, "ai_tutor_credits": 25}', false, 30, 3),
('Booster de Eliminação', 'Extra de eliminações para casos difíceis', 'help_package', 50, 
 '{"elimination_aids": 15}', false, 0, 4),
('Créditos IA Tutor', 'Créditos extras para o tutor de IA', 'help_package', 75, 
 '{"ai_tutor_credits": 12}', false, 0, 5);

-- Inserir ofertas especiais dinâmicas
INSERT INTO public.radcoin_special_offers (name, description, original_price, sale_price, discount_percentage, benefits, is_limited, max_redemptions, expires_at) VALUES
('Mega Pacote Weekend', 'Oferta especial de fim de semana', 400, 200, 50,
 '{"elimination_aids": 50, "skip_aids": 25, "ai_tutor_credits": 15, "bonus_points_multiplier": 1.5}', 
 true, 100, now() + interval '3 days'),
('Flash Sale Extremo', 'Por tempo limitado!', 300, 150, 50,
 '{"elimination_aids": 40, "skip_aids": 20, "ai_tutor_credits": 12}', 
 true, 50, now() + interval '6 hours'),
('Black Friday RadCoin', 'A maior promoção do ano!', 600, 250, 58,
 '{"elimination_aids": 100, "skip_aids": 50, "ai_tutor_credits": 30, "bonus_points_multiplier": 2.0}',
 true, 200, now() + interval '7 days');

-- Inserir configurações iniciais da loja
INSERT INTO public.radcoin_store_config (key, value, description, is_public) VALUES
('store_enabled', 'true', 'Se a loja está habilitada para usuários', true),
('daily_deals_enabled', 'true', 'Se as ofertas diárias estão ativas', true),
('max_purchases_per_day', '10', 'Máximo de compras por usuário por dia', false),
('featured_products', '[]', 'IDs dos produtos em destaque', true),
('store_announcement', '{"title": "Bem-vindo à Loja RadCoin!", "message": "Troque seus RadCoins por ajudas e benefícios exclusivos!"}', 'Anúncio da loja', true),
('discount_thresholds', '{"bronze": 1000, "silver": 5000, "gold": 10000}', 'Limites para descontos por nível de usuário', false),
('gift_enabled', 'false', 'Se é possível presentear outros usuários', false);