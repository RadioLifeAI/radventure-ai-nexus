
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  type: 'USER' | 'ADMIN';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, password, full_name, type }: CreateUserRequest = await req.json();

    console.log('Creating user with:', { email, full_name, type });

    // Validações básicas
    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({ error: 'Email, password e nome completo são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Criar usuário usando auth.admin.createUser()
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirmar email para admins
      user_metadata: {
        full_name: full_name
      }
    });

    if (authError) {
      console.error('Erro na criação do usuário:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ error: 'Falha ao criar usuário' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Usuário criado no auth:', authUser.user.id);

    // Aguardar um pouco para o trigger processar
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Atualizar o tipo do usuário se for ADMIN
    if (type === 'ADMIN') {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          type: 'ADMIN',
          full_name: full_name 
        })
        .eq('id', authUser.user.id);

      if (updateError) {
        console.error('Erro ao atualizar tipo do usuário:', updateError);
      }

      // Adicionar role administrativa
      const { error: roleError } = await supabaseAdmin
        .from('admin_user_roles')
        .insert({
          user_id: authUser.user.id,
          admin_role: 'TechAdmin',
          assigned_by: authUser.user.id,
          is_active: true
        });

      if (roleError) {
        console.error('Erro ao adicionar role administrativa:', roleError);
      }
    }

    // Buscar dados completos do usuário criado
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
    }

    console.log('Usuário criado com sucesso:', {
      id: authUser.user.id,
      email: authUser.user.email,
      type: profile?.type || 'USER'
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          full_name: full_name,
          type: profile?.type || 'USER'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro inesperado:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
