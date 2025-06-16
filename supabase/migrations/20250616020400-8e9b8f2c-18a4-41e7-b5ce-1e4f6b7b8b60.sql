
-- FASE 1: CORREÇÃO CRÍTICA DO TRIGGER E ESTRUTURA DO BANCO

-- Primeiro, vamos recriar o trigger com tratamento de erros robusto
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar função melhorada com tratamento de erros e logs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_type_val public.profile_type := 'USER';
  academic_stage_val public.academic_stage;
  error_msg text;
BEGIN
  -- Log do início da função
  RAISE LOG 'handle_new_user: Starting for user %', NEW.id;
  
  -- Validar e mapear academic_stage do metadata
  BEGIN
    IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data ? 'academic_stage' THEN
      academic_stage_val := (NEW.raw_user_meta_data ->> 'academic_stage')::public.academic_stage;
      RAISE LOG 'handle_new_user: Academic stage mapped to %', academic_stage_val;
    ELSE
      academic_stage_val := 'Student'::public.academic_stage; -- Valor padrão
      RAISE LOG 'handle_new_user: Using default academic stage: Student';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    academic_stage_val := 'Student'::public.academic_stage;
    RAISE LOG 'handle_new_user: Error mapping academic_stage, using default: %', SQLERRM;
  END;

  -- Inserir na tabela profiles com tratamento de erro
  BEGIN
    INSERT INTO public.profiles (
      id,
      type,
      email,
      username,
      full_name,
      academic_stage,
      medical_specialty,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_type_val,
      NEW.email,
      ('user_' || substring(NEW.id::text from 1 for 8)),
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
      academic_stage_val,
      COALESCE(NEW.raw_user_meta_data ->> 'medical_specialty', ''),
      NOW(),
      NOW()
    );
    
    RAISE LOG 'handle_new_user: Profile created successfully for user %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    RAISE LOG 'handle_new_user: Error creating profile for user %: %', NEW.id, error_msg;
    
    -- Re-raise the error to prevent user creation if profile fails
    RAISE EXCEPTION 'Failed to create user profile: %', error_msg;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user: Critical error for user %: %', NEW.id, SQLERRM;
  RAISE;
END;
$$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_academic_stage_idx ON public.profiles(academic_stage);
CREATE INDEX IF NOT EXISTS profiles_medical_specialty_idx ON public.profiles(medical_specialty);

-- Criar tabela de logs de cadastro para monitoramento
CREATE TABLE IF NOT EXISTS public.signup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  event_data jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Função para log de eventos de cadastro
CREATE OR REPLACE FUNCTION public.log_signup_event(
  p_user_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.signup_logs (user_id, event_type, event_data, error_message)
  VALUES (p_user_id, p_event_type, p_event_data, p_error_message);
EXCEPTION WHEN OTHERS THEN
  -- Não queremos que logs falhem o processo principal
  RAISE LOG 'Failed to log signup event: %', SQLERRM;
END;
$$;

-- Adicionar RLS na tabela de logs
ALTER TABLE public.signup_logs ENABLE ROW LEVEL SECURITY;

-- Policy para admins verem todos os logs
CREATE POLICY "Admins can view all signup logs"
  ON public.signup_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND type = 'ADMIN'
    )
  );
