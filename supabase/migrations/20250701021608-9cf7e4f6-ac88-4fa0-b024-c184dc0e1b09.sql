
-- Adicionar campos de nível e título ao perfil do usuário
ALTER TABLE public.profiles 
ADD COLUMN user_level INTEGER DEFAULT 1,
ADD COLUMN current_xp INTEGER DEFAULT 0,
ADD COLUMN active_title TEXT DEFAULT NULL;

-- Criar tabela de configuração de níveis
CREATE TABLE public.user_levels (
  id SERIAL PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE,
  xp_required INTEGER NOT NULL,
  title_unlocked TEXT,
  radcoin_reward INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de títulos desbloqueados por usuário
CREATE TABLE public.user_titles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, title)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;

-- Política para user_titles
CREATE POLICY "Users can view their own titles" ON public.user_titles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own titles" ON public.user_titles
  FOR UPDATE USING (user_id = auth.uid());

-- Inserir configuração inicial de níveis com temática radiológica
INSERT INTO public.user_levels (level, xp_required, title_unlocked, radcoin_reward, description) VALUES
(1, 0, 'Estudante de Radiologia', 0, 'Início da jornada radiológica'),
(2, 100, 'Técnico Iniciante', 50, 'Primeiros passos na interpretação'),
(3, 250, 'Observador Atento', 75, 'Desenvolvendo o olhar clínico'),
(4, 500, 'Analista de Imagens', 100, 'Interpretação básica consolidada'),
(5, 800, 'Especialista Junior', 150, 'Conhecimento em múltiplas modalidades'),
(6, 1200, 'Radiologista Competente', 200, 'Diagnósticos precisos e confiáveis'),
(7, 1700, 'Expert em Diagnóstico', 300, 'Casos complexos dominados'),
(8, 2500, 'Mestre da Radiologia', 400, 'Referência em interpretação'),
(9, 3500, 'Professor Radiológico', 500, 'Conhecimento enciclopédico'),
(10, 5000, 'Lenda da Radiologia', 1000, 'O ápice da excelência radiológica');

-- Função para calcular nível baseado em pontos
CREATE OR REPLACE FUNCTION public.calculate_user_level(p_total_points INTEGER)
RETURNS TABLE(level INTEGER, xp_required INTEGER, next_level_xp INTEGER, title TEXT, progress_percentage NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_level INTEGER := 1;
  current_xp INTEGER := 0;
  next_xp INTEGER := 100;
  current_title TEXT := 'Estudante de Radiologia';
  progress NUMERIC := 0;
BEGIN
  -- Encontrar o nível atual baseado nos pontos
  SELECT ul.level, ul.xp_required, COALESCE(ul.title_unlocked, 'Estudante de Radiologia')
  INTO current_level, current_xp, current_title
  FROM public.user_levels ul
  WHERE ul.xp_required <= p_total_points
  ORDER BY ul.level DESC
  LIMIT 1;
  
  -- Encontrar XP necessário para próximo nível
  SELECT ul.xp_required INTO next_xp
  FROM public.user_levels ul
  WHERE ul.level = current_level + 1;
  
  -- Se não há próximo nível, usar o XP atual como máximo
  IF next_xp IS NULL THEN
    next_xp := current_xp;
    progress := 100;
  ELSE
    -- Calcular progresso percentual
    progress := CASE 
      WHEN next_xp = current_xp THEN 100
      ELSE ROUND(((p_total_points - current_xp)::NUMERIC / (next_xp - current_xp)::NUMERIC) * 100, 1)
    END;
  END IF;
  
  RETURN QUERY SELECT current_level, current_xp, next_xp, current_title, progress;
END;
$$;

-- Função para processar level up e dar recompensas
CREATE OR REPLACE FUNCTION public.process_level_up(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_points INTEGER;
  old_level INTEGER;
  new_level_data RECORD;
  radcoin_reward INTEGER := 0;
  level_up_occurred BOOLEAN := FALSE;
  result JSONB;
BEGIN
  -- Buscar pontos atuais e nível do usuário
  SELECT total_points, user_level INTO user_points, old_level
  FROM public.profiles WHERE id = p_user_id;
  
  -- Calcular novo nível
  SELECT * INTO new_level_data
  FROM public.calculate_user_level(user_points);
  
  -- Verificar se houve level up
  IF new_level_data.level > old_level THEN
    level_up_occurred := TRUE;
    
    -- Buscar recompensa do novo nível
    SELECT radcoin_reward INTO radcoin_reward
    FROM public.user_levels
    WHERE level = new_level_data.level;
    
    -- Atualizar perfil com novo nível
    UPDATE public.profiles
    SET user_level = new_level_data.level,
        current_xp = user_points,
        active_title = COALESCE(active_title, new_level_data.title),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Desbloquear título se disponível
    IF new_level_data.title IS NOT NULL THEN
      INSERT INTO public.user_titles (user_id, title, is_active)
      VALUES (p_user_id, new_level_data.title, active_title IS NULL)
      ON CONFLICT (user_id, title) DO NOTHING;
    END IF;
    
    -- Dar RadCoins de recompensa
    IF radcoin_reward > 0 THEN
      PERFORM public.award_radcoins(
        p_user_id, 
        radcoin_reward, 
        'level_up',
        jsonb_build_object(
          'new_level', new_level_data.level,
          'title_unlocked', new_level_data.title
        )
      );
    END IF;
    
    -- Criar notificação de level up
    INSERT INTO public.notifications (
      user_id, type, title, message, priority, action_url, action_label, metadata
    ) VALUES (
      p_user_id,
      'level_up',
      '🆙 Level Up! Nível ' || new_level_data.level,
      'Parabéns! Você alcançou o nível ' || new_level_data.level || ' e desbloqueou o título "' || new_level_data.title || '"!',
      'high',
      '/app/dashboard',
      'Ver Progresso',
      jsonb_build_object(
        'new_level', new_level_data.level,
        'radcoin_reward', radcoin_reward,
        'title_unlocked', new_level_data.title
      )
    );
  ELSE
    -- Apenas atualizar XP atual
    UPDATE public.profiles
    SET current_xp = user_points,
        updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
  
  -- Retornar resultado
  result := jsonb_build_object(
    'level_up_occurred', level_up_occurred,
    'old_level', old_level,
    'new_level', new_level_data.level,
    'radcoin_reward', radcoin_reward,
    'title_unlocked', new_level_data.title,
    'progress_percentage', new_level_data.progress_percentage,
    'current_xp', user_points,
    'next_level_xp', new_level_data.next_level_xp
  );
  
  RETURN result;
END;
$$;

-- Trigger para processar level up automaticamente quando pontos mudarem
CREATE OR REPLACE FUNCTION public.trigger_level_up_check()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Só processar se os pontos aumentaram
  IF NEW.total_points > OLD.total_points THEN
    PERFORM public.process_level_up(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER check_level_up_on_points_change
  AFTER UPDATE OF total_points ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_level_up_check();
