
-- Criando bucket para imagens de casos médicos
insert into storage.buckets (id, name, public)
values ('medical-cases', 'medical-cases', true);

-- Permitir upload, leitura, atualização e exclusão para qualquer usuário autenticado
-- (Ajuste conforme necessidade de segurança. Caso queira que todos possam ver as imagens, mantenha público.)
-- Política permissiva só para ilustrar; ajuste para produção conforme a privacidade desejada.
CREATE POLICY "Uploads públicos de imagens"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'medical-cases');

