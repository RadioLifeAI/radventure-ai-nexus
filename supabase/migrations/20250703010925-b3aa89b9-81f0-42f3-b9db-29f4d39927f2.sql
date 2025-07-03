-- Criar bucket case-images se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('case-images', 'case-images', true)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para o bucket case-images
INSERT INTO storage.objects (bucket_id, name, owner, metadata) VALUES ('case-images', '.keep', null, '{}') ON CONFLICT DO NOTHING;

-- Política de leitura pública
CREATE POLICY IF NOT EXISTS "case_images_public_select" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'case-images');

-- Política de upload para usuários autenticados  
CREATE POLICY IF NOT EXISTS "case_images_authenticated_insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'case-images' AND auth.role() = 'authenticated');

-- Política de atualização para usuários autenticados
CREATE POLICY IF NOT EXISTS "case_images_authenticated_update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'case-images' AND auth.role() = 'authenticated');

-- Política de exclusão para usuários autenticados
CREATE POLICY IF NOT EXISTS "case_images_authenticated_delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'case-images' AND auth.role() = 'authenticated');