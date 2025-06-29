
-- Criar tabela para notificações reais
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('event_starting', 'achievement_unlocked', 'ranking_update', 'new_event', 'reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias notificações
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias notificações
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Função para criar notificação automática quando evento inicia
CREATE OR REPLACE FUNCTION public.create_event_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar notificação para todos os usuários quando evento muda para ACTIVE
  IF NEW.status = 'ACTIVE' AND OLD.status != 'ACTIVE' THEN
    INSERT INTO public.notifications (user_id, type, title, message, priority, action_url, action_label, metadata)
    SELECT 
      p.id,
      'event_starting',
      'Evento iniciou agora! 🚀',
      'O evento "' || NEW.name || '" acabou de começar. Participe agora!',
      'high',
      '/app/evento/' || NEW.id,
      'Participar Agora',
      jsonb_build_object('event_id', NEW.id, 'event_name', NEW.name)
    FROM public.profiles p
    WHERE p.type = 'USER';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar notificações automáticas
CREATE TRIGGER event_status_notification_trigger
  AFTER UPDATE OF status ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.create_event_notification();
