-- FASE 1: Estrutura de dados para RadCoin Store Management

-- Tabela de produtos da loja RadCoin
CREATE TABLE IF NOT EXISTS public.radcoin_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'help_package', -- 'help_package', 'subscription', 'special_item'
  price INTEGER NOT NULL, -- em RadCoins
  benefits JSONB NOT NULL DEFAULT '{}', -- { elimination_aids: 10, skip_aids: 5, ai_tutor_credits: 3 }
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  discount_percentage INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  max_purchase_per_user INTEGER DEFAULT NULL, -- limite por usuário (null = ilimitado)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de ofertas especiais
CREATE TABLE IF NOT EXISTS public.radcoin_special_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  original_price INTEGER NOT NULL,
  sale_price INTEGER NOT NULL,
  discount_percentage INTEGER NOT NULL,
  benefits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_limited BOOLEAN DEFAULT false,
  max_redemptions INTEGER DEFAULT NULL,
  current_redemptions INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações da loja
CREATE TABLE IF NOT EXISTS public.radcoin_store_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- se pode ser visto pelos usuários
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabela de histórico detalhado de compras
CREATE TABLE IF NOT EXISTS public.radcoin_purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.radcoin_products(id),
  special_offer_id UUID REFERENCES public.radcoin_special_offers(id),
  purchase_type TEXT NOT NULL, -- 'product', 'special_offer', 'manual'
  radcoins_spent INTEGER NOT NULL,
  benefits_received JSONB NOT NULL DEFAULT '{}',
  transaction_id UUID REFERENCES public.radcoin_transactions_log(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.radcoin_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radcoin_special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radcoin_store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radcoin_purchase_history ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para produtos
CREATE POLICY "Anyone can view active products" ON public.radcoin_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.radcoin_products
  FOR ALL USING (is_admin(auth.uid()));

-- Políticas para ofertas especiais
CREATE POLICY "Anyone can view active offers" ON public.radcoin_special_offers
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage offers" ON public.radcoin_special_offers
  FOR ALL USING (is_admin(auth.uid()));

-- Políticas para configurações
CREATE POLICY "Users can view public configs" ON public.radcoin_store_config
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all configs" ON public.radcoin_store_config
  FOR ALL USING (is_admin(auth.uid()));

-- Políticas para histórico de compras
CREATE POLICY "Users can view own purchases" ON public.radcoin_purchase_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases" ON public.radcoin_purchase_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" ON public.radcoin_purchase_history
  FOR ALL USING (is_admin(auth.uid()));

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_radcoin_products_updated_at
  BEFORE UPDATE ON public.radcoin_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_radcoin_special_offers_updated_at
  BEFORE UPDATE ON public.radcoin_special_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_radcoin_store_config_updated_at
  BEFORE UPDATE ON public.radcoin_store_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para processar compra de produto
CREATE OR REPLACE FUNCTION purchase_radcoin_product(
  p_user_id UUID,
  p_product_id UUID DEFAULT NULL,
  p_special_offer_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  product_data RECORD;
  offer_data RECORD;
  user_balance INTEGER;
  required_radcoins INTEGER;
  benefits_to_grant JSONB;
  purchase_type TEXT;
  transaction_id UUID;
  result JSONB;
BEGIN
  -- Verificar saldo do usuário
  SELECT radcoin_balance INTO user_balance
  FROM public.profiles WHERE id = p_user_id;

  IF user_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Determinar tipo de compra e dados
  IF p_product_id IS NOT NULL THEN
    SELECT * INTO product_data
    FROM public.radcoin_products
    WHERE id = p_product_id AND is_active = true;
    
    IF product_data IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Product not found or inactive');
    END IF;
    
    required_radcoins := product_data.price;
    benefits_to_grant := product_data.benefits;
    purchase_type := 'product';
    
  ELSIF p_special_offer_id IS NOT NULL THEN
    SELECT * INTO offer_data
    FROM public.radcoin_special_offers
    WHERE id = p_special_offer_id 
      AND is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
      AND (max_redemptions IS NULL OR current_redemptions < max_redemptions);
    
    IF offer_data IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Offer not found, expired, or sold out');
    END IF;
    
    required_radcoins := offer_data.sale_price;
    benefits_to_grant := offer_data.benefits;
    purchase_type := 'special_offer';
    
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'No product or offer specified');
  END IF;

  -- Verificar se tem RadCoins suficientes
  IF user_balance < required_radcoins THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient RadCoins');
  END IF;

  -- Debitar RadCoins
  UPDATE public.profiles
  SET radcoin_balance = radcoin_balance - required_radcoins,
      updated_at = now()
  WHERE id = p_user_id;

  -- Registrar transação
  INSERT INTO public.radcoin_transactions_log (
    user_id, tx_type, amount, balance_after, metadata
  ) VALUES (
    p_user_id,
    'store_purchase',
    -required_radcoins,
    user_balance - required_radcoins,
    jsonb_build_object(
      'purchase_type', purchase_type,
      'product_id', p_product_id,
      'special_offer_id', p_special_offer_id
    )
  ) RETURNING id INTO transaction_id;

  -- Conceder benefícios
  IF benefits_to_grant ? 'elimination_aids' THEN
    PERFORM add_help_aids(
      p_user_id,
      (benefits_to_grant->>'elimination_aids')::integer,
      0, 0
    );
  END IF;

  IF benefits_to_grant ? 'skip_aids' THEN
    PERFORM add_help_aids(
      p_user_id, 0,
      (benefits_to_grant->>'skip_aids')::integer,
      0
    );
  END IF;

  IF benefits_to_grant ? 'ai_tutor_credits' THEN
    PERFORM add_help_aids(
      p_user_id, 0, 0,
      (benefits_to_grant->>'ai_tutor_credits')::integer
    );
  END IF;

  -- Registrar compra no histórico
  INSERT INTO public.radcoin_purchase_history (
    user_id, product_id, special_offer_id, purchase_type,
    radcoins_spent, benefits_received, transaction_id
  ) VALUES (
    p_user_id, p_product_id, p_special_offer_id, purchase_type,
    required_radcoins, benefits_to_grant, transaction_id
  );

  -- Atualizar contador de ofertas especiais
  IF purchase_type = 'special_offer' THEN
    UPDATE public.radcoin_special_offers
    SET current_redemptions = current_redemptions + 1
    WHERE id = p_special_offer_id;
  END IF;

  result := jsonb_build_object(
    'success', true,
    'radcoins_spent', required_radcoins,
    'benefits_received', benefits_to_grant,
    'new_balance', user_balance - required_radcoins
  );

  RETURN result;
END;
$$;