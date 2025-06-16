
-- Função para configurar automaticamente o primeiro admin
CREATE OR REPLACE FUNCTION public.setup_first_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Verifica se já existe algum admin
  IF EXISTS (SELECT 1 FROM public.admin_user_roles WHERE is_active = true) THEN
    RETURN; -- Já existe admin, não faz nada
  END IF;
  
  -- Pega o usuário atual (quem está executando a função)
  first_user_id := auth.uid();
  
  IF first_user_id IS NOT NULL THEN
    -- Insere role DEV para o usuário atual
    INSERT INTO public.admin_user_roles (user_id, admin_role, assigned_by, is_active)
    VALUES (first_user_id, 'DEV', first_user_id, true)
    ON CONFLICT (user_id, admin_role) DO UPDATE SET 
      is_active = true,
      assigned_at = now();
      
    RAISE NOTICE 'Admin DEV configurado para usuário: %', first_user_id;
  ELSE
    RAISE NOTICE 'Nenhum usuário autenticado encontrado';
  END IF;
END;
$$;

-- Executa a função para configurar o admin
SELECT public.setup_first_admin();
