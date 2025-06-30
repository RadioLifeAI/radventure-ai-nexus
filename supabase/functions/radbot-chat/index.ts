
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, context } = await req.json();
    
    // Extrair user_id do token JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      throw new Error('Invalid token');
    }

    // Verificar e cobrar RadCoins (1 RadCoin por mensagem)
    const { data: chargeResult, error: chargeError } = await supabase
      .rpc('charge_radcoins_for_ai_chat', {
        p_user_id: user.id,
        p_amount: 1
      });

    if (chargeError || !chargeResult) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient RadCoins',
        needsCredits: true 
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar dados do usuário para contexto
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: userStats } = await supabase
      .from('user_case_history')
      .select('*')
      .eq('user_id', user.id)
      .order('answered_at', { ascending: false })
      .limit(10);

    // Criar contexto inteligente
    const systemPrompt = `
Você é o RadBot AI, assistente virtual especializado do RadVenture - um app gamificado de radiologia médica.

SUAS FUNÇÕES PRINCIPAIS:
1. Explicar funcionamento do app (ranking, conquistas, pontuação, eventos, como jogar)
2. Responder dúvidas sobre radiologia médica usando fontes confiáveis (Radiopaedia, CBR, RSNA, ACR)
3. Interagir com progresso do usuário no game de forma personalizada
4. Detectar pedidos de feedback/report e sugerir registrar como report oficial
5. Fornecer suporte contextual baseado na página/situação atual

DADOS DO USUÁRIO ATUAL:
- Nome: ${profile?.full_name || profile?.username || 'Usuário'}
- Pontos: ${profile?.total_points || 0}
- RadCoins: ${profile?.radcoin_balance || 0}
- Streak: ${profile?.current_streak || 0} dias
- Especialidade: ${profile?.medical_specialty || 'Não definida'}
- Estágio: ${profile?.academic_stage || 'Não definido'}

HISTÓRICO RECENTE:
${userStats?.map(stat => `- Caso resolvido: ${stat.is_correct ? 'Correto' : 'Incorreto'} (${stat.points} pts)`).join('\n') || 'Nenhum caso resolvido ainda'}

COMANDOS ESPECIAIS:
- /meus-stats: Mostrar estatísticas detalhadas
- /radcoins: Explicar como ganhar RadCoins
- /ranking: Mostrar posição nos rankings
- /eventos: Explicar sobre eventos ativos
- /conquistas: Mostrar conquistas disponíveis

CONTEXTO ATUAL: ${context?.currentPage || 'Dashboard'}

IMPORTANTE:
- Seja amigável e use linguagem gamificada
- Parabenize conquistas e motive o usuário
- Para dúvidas médicas, sempre cite fontes confiáveis
- Se detectar reclamação/sugestão, pergunte se deseja registrar report
- Mantenha respostas concisas mas informativas
- Use emojis médicos: 🩻 🔬 📊 🏆 ✨
`;

    // Buscar histórico da conversa para contexto
    const { data: chatHistory } = await supabase
      .from('ai_chat_messages')
      .select('message_type, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory?.map(msg => ({
        role: msg.message_type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })) || []),
      { role: 'user', content: message }
    ];

    // Chamar OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices[0].message.content;

    // Salvar mensagens no banco
    await supabase.from('ai_chat_messages').insert([
      {
        session_id: sessionId,
        user_id: user.id,
        message_type: 'user',
        content: message,
        radcoins_cost: 1,
        tokens_used: aiResponse.usage?.total_tokens || 0,
        context_data: context || {}
      },
      {
        session_id: sessionId,
        user_id: user.id,
        message_type: 'assistant',
        content: assistantMessage,
        radcoins_cost: 0,
        context_data: { tokens: aiResponse.usage?.total_tokens || 0 }
      }
    ]);

    // Atualizar estatísticas da sessão
    await supabase
      .from('ai_chat_sessions')
      .update({
        total_messages: (chatHistory?.length || 0) + 2,
        total_radcoins_spent: 1
      })
      .eq('id', sessionId);

    // Detectar se é uma reclamação/sugestão para report
    const isComplaint = /\b(erro|bug|problema|falha|ruim|melhorar|sugestão|reclamação)\b/i.test(message);

    return new Response(JSON.stringify({
      response: assistantMessage,
      radcoinsSpent: 1,
      tokensUsed: aiResponse.usage?.total_tokens || 0,
      suggestReport: isComplaint
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in radbot-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackMessage: "Desculpe, estou com dificuldades técnicas. Tente novamente em alguns minutos! 🤖"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
