-- Criar bucket case-images se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('case-images', 'case-images', true)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes se existirem e recriar
DROP POLICY IF EXISTS "case_images_public_select" ON storage.objects;
DROP POLICY IF EXISTS "case_images_authenticated_insert" ON storage.objects;  
DROP POLICY IF EXISTS "case_images_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "case_images_authenticated_delete" ON storage.objects;

-- Política de leitura pública
CREATE POLICY "case_images_public_select" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'case-images');

-- Política de upload para usuários autenticados  
CREATE POLICY "case_images_authenticated_insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'case-images' AND auth.role() = 'authenticated');

-- Política de atualização para usuários autenticados
CREATE POLICY "case_images_authenticated_update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'case-images' AND auth.role() = 'authenticated');

-- Política de exclusão para usuários autenticados
CREATE POLICY "case_images_authenticated_delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'case-images' AND auth.role() = 'authenticated');