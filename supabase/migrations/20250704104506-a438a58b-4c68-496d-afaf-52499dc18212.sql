-- SISTEMA DE IMAGENS SEPARADO PARA AVATARS E BANNERS DE EVENTOS

-- Criar bucket para avatars de usuários (permanentes)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para banners de eventos (temporários)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-banners', 'event-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Tabela para tracking de banners de eventos (avatars usam profiles.avatar_url diretamente)
CREATE TABLE IF NOT EXISTS event_banner_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  thumb_url TEXT NOT NULL,
  medium_url TEXT NOT NULL,
  full_url TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size_bytes INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies para avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies para banners de eventos
CREATE POLICY "Event banner images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'event-banners');

CREATE POLICY "Admins can manage event banners" ON storage.objects
FOR ALL USING (bucket_id = 'event-banners' AND get_user_type(auth.uid()) = 'ADMIN');

-- RLS policies para tabela event_banner_images
ALTER TABLE event_banner_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view event banner images" ON event_banner_images
FOR SELECT USING (true);

CREATE POLICY "Admins can manage event banner images" ON event_banner_images
FOR ALL USING (get_user_type(auth.uid()) = 'ADMIN');

-- Trigger para updated_at
CREATE TRIGGER update_event_banner_images_updated_at
BEFORE UPDATE ON event_banner_images
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função para limpeza automática de banners órfãos
CREATE OR REPLACE FUNCTION cleanup_orphaned_event_banners()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deletar registros de banners cujos eventos não existem mais
  DELETE FROM event_banner_images 
  WHERE event_id NOT IN (SELECT id FROM events);
  
  -- Log da operação
  RAISE NOTICE 'Limpeza de banners órfãos executada em %', NOW();
END;
$$;