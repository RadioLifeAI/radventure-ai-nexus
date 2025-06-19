
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { hash, verify } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'
import { create, verify as verifyJWT } from 'https://deno.land/x/djwt@v3.0.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const JWT_SECRET = new TextEncoder().encode(
  Deno.env.get('JWT_SECRET') || 'default-secret-key-change-in-production'
)

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  nome_completo: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    console.log('Auth action:', action);

    switch (action) {
      case 'login': {
        const { email, password }: LoginRequest = await req.json();

        // Buscar usuário
        const { data: usuario, error: userError } = await supabase
          .from('usuarios_app')
          .select('*')
          .eq('email', email)
          .eq('ativo', true)
          .single();

        if (userError || !usuario) {
          return new Response(
            JSON.stringify({ error: 'Credenciais inválidas' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verificar senha
        const senhaValida = await verify(password, usuario.senha_hash);
        if (!senhaValida) {
          return new Response(
            JSON.stringify({ error: 'Credenciais inválidas' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Criar JWT token
        const payload = {
          userId: usuario.id,
          email: usuario.email,
          tipo: usuario.tipo,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 dias
        };

        const token = await create({ alg: "HS256", typ: "JWT" }, payload, JWT_SECRET);
        const tokenHash = await hash(token, 10);

        // Salvar sessão
        const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 dias
        await supabase
          .from('usuarios_sessoes')
          .insert({
            usuario_id: usuario.id,
            token_hash: tokenHash,
            expires_at: expiresAt.toISOString(),
            user_agent: req.headers.get('user-agent'),
          });

        // Atualizar último login
        await supabase
          .from('usuarios_app')
          .update({ ultimo_login: new Date().toISOString() })
          .eq('id', usuario.id);

        // Buscar roles administrativos
        const { data: roles } = await supabase
          .from('usuarios_admin_roles')
          .select('role')
          .eq('usuario_id', usuario.id)
          .eq('ativo', true);

        return new Response(
          JSON.stringify({
            success: true,
            token,
            usuario: {
              id: usuario.id,
              email: usuario.email,
              nome_completo: usuario.nome_completo,
              username: usuario.username,
              tipo: usuario.tipo,
              avatar_url: usuario.avatar_url,
              radcoin_balance: usuario.radcoin_balance,
              total_points: usuario.total_points,
              roles: roles?.map(r => r.role) || []
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'register': {
        const { email, password, nome_completo }: RegisterRequest = await req.json();

        if (!email || !password || !nome_completo) {
          return new Response(
            JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (password.length < 6) {
          return new Response(
            JSON.stringify({ error: 'Senha deve ter pelo menos 6 caracteres' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verificar se email já existe
        const { data: existingUser } = await supabase
          .from('usuarios_app')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser) {
          return new Response(
            JSON.stringify({ error: 'Email já está em uso' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Hash da senha
        const senhaHash = await hash(password, 12);

        // Criar usuário
        const { data: novoUsuario, error: createError } = await supabase
          .from('usuarios_app')
          .insert({
            email,
            senha_hash: senhaHash,
            nome_completo,
            username: 'user_' + crypto.randomUUID().substring(0, 8),
            tipo: 'USER'
          })
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar usuário:', createError);
          return new Response(
            JSON.stringify({ error: 'Erro ao criar usuário' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Usuário criado com sucesso',
            usuario: {
              id: novoUsuario.id,
              email: novoUsuario.email,
              nome_completo: novoUsuario.nome_completo
            }
          }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'verify': {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
          return new Response(
            JSON.stringify({ error: 'Token não fornecido' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          const payload = await verifyJWT(token, JWT_SECRET);
          
          // Verificar se sessão existe e não expirou
          const { data: sessao } = await supabase
            .from('usuarios_sessoes')
            .select('*')
            .eq('usuario_id', payload.userId)
            .gt('expires_at', new Date().toISOString())
            .single();

          if (!sessao) {
            return new Response(
              JSON.stringify({ error: 'Sessão inválida ou expirada' }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Buscar dados atualizados do usuário
          const { data: usuario } = await supabase
            .from('usuarios_app')
            .select('*')
            .eq('id', payload.userId)
            .eq('ativo', true)
            .single();

          if (!usuario) {
            return new Response(
              JSON.stringify({ error: 'Usuário não encontrado' }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Buscar roles
          const { data: roles } = await supabase
            .from('usuarios_admin_roles')
            .select('role')
            .eq('usuario_id', usuario.id)
            .eq('ativo', true);

          return new Response(
            JSON.stringify({
              success: true,
              usuario: {
                id: usuario.id,
                email: usuario.email,
                nome_completo: usuario.nome_completo,
                username: usuario.username,
                tipo: usuario.tipo,
                avatar_url: usuario.avatar_url,
                radcoin_balance: usuario.radcoin_balance,
                total_points: usuario.total_points,
                roles: roles?.map(r => r.role) || []
              }
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );

        } catch (error) {
          console.error('Erro ao verificar token:', error);
          return new Response(
            JSON.stringify({ error: 'Token inválido' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'logout': {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (token) {
          try {
            const payload = await verifyJWT(token, JWT_SECRET);
            
            // Remover sessão
            await supabase
              .from('usuarios_sessoes')
              .delete()
              .eq('usuario_id', payload.userId);

          } catch (error) {
            console.warn('Erro ao processar logout:', error);
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Logout realizado' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação não encontrada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
