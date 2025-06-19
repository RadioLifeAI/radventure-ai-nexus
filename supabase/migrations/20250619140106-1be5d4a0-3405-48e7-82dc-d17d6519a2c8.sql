
-- Criar bucket para imagens de casos médicos
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-images', 'case-images', true);

-- Política para permitir uploads para usuários autenticados
CREATE POLICY "Authenticated users can upload case images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'case-images' AND auth.role() = 'authenticated');

-- Política para permitir leitura pública das imagens
CREATE POLICY "Public access to case images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'case-images');

-- Política para permitir atualização pelos proprietários/admins
CREATE POLICY "Users can update case images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'case-images' AND auth.role() = 'authenticated');

-- Política para permitir exclusão pelos proprietários/admins
CREATE POLICY "Users can delete case images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'case-images' AND auth.role() = 'authenticated');
