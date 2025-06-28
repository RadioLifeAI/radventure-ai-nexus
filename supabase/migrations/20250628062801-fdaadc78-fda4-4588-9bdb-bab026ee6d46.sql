
-- CORREÇÃO EMERGENCIAL - Adicionar tipos de transação RadCoin faltantes
DO $$ BEGIN
    -- Adicionar novos valores ao enum radcoin_tx_type
    ALTER TYPE radcoin_tx_type ADD VALUE IF NOT EXISTS 'profile_completion';
    ALTER TYPE radcoin_tx_type ADD VALUE IF NOT EXISTS 'profile_completion_bonus';
    ALTER TYPE radcoin_tx_type ADD VALUE IF NOT EXISTS 'daily_login';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar bucket para avatares no Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para o bucket avatars
DO $$ BEGIN
    -- Política para visualizar avatares (público)
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

    -- Política para upload de avatares (usuários autenticados)
    DROP POLICY IF EXISTS "Avatar Upload" ON storage.objects;
    CREATE POLICY "Avatar Upload"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

    -- Política para atualizar avatares (próprio usuário)
    DROP POLICY IF EXISTS "Avatar Update" ON storage.objects;
    CREATE POLICY "Avatar Update"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

    -- Política para deletar avatares (próprio usuário)
    DROP POLICY IF EXISTS "Avatar Delete" ON storage.objects;
    CREATE POLICY "Avatar Delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION
    WHEN OTHERS THEN null;
END $$;
