-- CORREÇÃO COMPLETA DO SISTEMA DE UPLOAD DE BANNERS (Fases 1 e 2)

-- 1. GARANTIR QUE O BUCKET event-banners EXISTE E É PÚBLICO
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-banners', 'event-banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. REMOVER POLÍTICAS CONFLITANTES E RECRIAR CORRETAMENTE
DROP POLICY IF EXISTS "Event banner images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage event banners" ON storage.objects;

-- 3. CRIAR POLÍTICAS RLS CORRETAS PARA O BUCKET event-banners
CREATE POLICY "event_banners_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'event-banners');

CREATE POLICY "event_banners_authenticated_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-banners' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "event_banners_authenticated_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'event-banners' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "event_banners_authenticated_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'event-banners' 
  AND auth.role() = 'authenticated'
);

-- 4. GARANTIR QUE A TABELA event_banner_images TEM RLS CORRETO
ALTER TABLE event_banner_images ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Everyone can view event banner images" ON event_banner_images;
DROP POLICY IF EXISTS "Admins can manage event banner images" ON event_banner_images;

-- Criar políticas corretas
CREATE POLICY "event_banner_images_public_read" ON event_banner_images
FOR SELECT USING (true);

CREATE POLICY "event_banner_images_authenticated_insert" ON event_banner_images
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "event_banner_images_authenticated_update" ON event_banner_images
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "event_banner_images_authenticated_delete" ON event_banner_images
FOR DELETE USING (auth.role() = 'authenticated');

-- 5. CRIAR FUNÇÃO DE DIAGNÓSTICO PARA DEBUGGING
CREATE OR REPLACE FUNCTION public.debug_event_banner_upload(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  bucket_exists boolean;
  bucket_public boolean;
  policies_count integer;
  event_exists boolean;
BEGIN
  -- Verificar se bucket existe e é público
  SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'event-banners'),
         COALESCE((SELECT public FROM storage.buckets WHERE id = 'event-banners'), false)
  INTO bucket_exists, bucket_public;
  
  -- Contar políticas do bucket
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies 
  WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname LIKE '%event_banner%';
  
  -- Verificar se evento existe
  SELECT EXISTS(SELECT 1 FROM events WHERE id = p_event_id) INTO event_exists;
  
  result := jsonb_build_object(
    'bucket_exists', bucket_exists,
    'bucket_public', bucket_public,
    'storage_policies_count', policies_count,
    'event_exists', event_exists,
    'user_authenticated', auth.uid() IS NOT NULL,
    'user_id', auth.uid(),
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$;