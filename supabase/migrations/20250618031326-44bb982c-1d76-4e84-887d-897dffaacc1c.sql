
-- Criar uma função simplificada que não tenta criar registros em tabelas com foreign keys para auth.users
CREATE OR REPLACE FUNCTION public.create_admin_direct(
  p_email text, 
  p_full_name text, 
  p_type text DEFAULT 'ADMIN'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  new_user_id := gen_random_uuid();
  
  -- Inserir usuário na tabela profiles apenas
  INSERT INTO public.profiles (
    id, email, full_name, type, username, created_at, updated_at
  ) VALUES (
    new_user_id,
    p_email,
    p_full_name,
    p_type::profile_type,
    'admin_' || substring(new_user_id::text from 1 for 8),
    now(),
    now()
  );
  
  -- Inserir role administrativa básica
  INSERT INTO public.admin_user_roles (user_id, admin_role, assigned_by, is_active, assigned_at)
  VALUES (new_user_id, 'TechAdmin', new_user_id, true, now());
  
  -- NÃO inserir em user_benefits e user_help_aids pois causam erro de foreign key
  
  RETURN new_user_id;
END;
$$;
