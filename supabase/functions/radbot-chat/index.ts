
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    
    if (!message || !userId) {
      throw new Error('Mensagem e userId são obrigatórios');
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar saldo atual primeiro
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('radcoin_balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ 
        error: 'Erro ao verificar saldo do usuário' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const currentBalance = profile.radcoin_balance || 0;
    const chatCost = 5;

    if (currentBalance < chatCost) {
      return new Response(JSON.stringify({ 
        error: 'Saldo insuficiente. Você precisa de 5 RadCoins para enviar uma mensagem.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Debitar RadCoins usando a função award_radcoins com valor negativo
    const { error: debitError } = await supabase.rpc('award_radcoins', {
      p_user_id: userId,
      p_amount: -chatCost,
      p_transaction_type: 'premium_service',
      p_metadata: { service: 'radbot_ai', cost_per_message: chatCost }
    });

    if (debitError) {
      console.error('Erro ao debitar RadCoins:', debitError);
      return new Response(JSON.stringify({ 
        error: 'Erro ao processar pagamento' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar dados do usuário para contexto
    const { data: fullProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Buscar progresso do usuário
    const { data: caseHistory } = await supabase
      .from('user_case_history')
      .select('*')
      .eq('user_id', userId)
      .order('answered_at', { ascending: false })
      .limit(10);

    // Criar contexto personalizado
    const userContext = `
Dados do usuário:
- Nome: ${fullProfile?.full_name || 'Usuário'}
- Especialidade: ${fullProfile?.medical_specialty || 'Não informada'}
- Pontos totais: ${fullProfile?.total_points || 0}
- RadCoins: ${(fullProfile?.radcoin_balance || 0) - chatCost}
- Casos resolvidos: ${caseHistory?.length || 0}
- Último acesso: ${fullProfile?.updated_at || 'Não informado'}
`;

    // Preparar prompt do sistema
    const systemPrompt = `Você é o RadBot AI, assistente especializado da plataforma RadVenture para estudantes de radiologia médica.

SUAS PRINCIPAIS FUNÇÕES:
1. Explicar o funcionamento do app RadVenture
2. Ensinar conceitos de radiologia médica (baseado em Radiopaedia, CBR, RSNA, ACR)
3. Mostrar progresso do usuário quando solicitado
4. Ajudar com navegação e funcionalidades
5. Criar reports quando o usuário relatar problemas

CONTEXTO DO USUÁRIO:
${userContext}

COMANDOS ESPECIAIS:
- /meus-stats: Mostrar estatísticas do usuário
- /radcoins: Explicar sobre RadCoins
- /eventos: Informações sobre eventos
- /conquistas: Sistema de conquistas

REGRAS IMPORTANTES:
- Sempre use linguagem técnica mas acessível
- Cite fontes médicas quando apropriado
- Se detectar um pedido de suporte/bug, sugira criar um report
- Mantenha respostas concisas e úteis
- Use emojis médicos: 🩺🔬💊🧬⚡

DISCLAIMER: Lembre sempre que suas informações são educacionais e não substituem consulta médica profissional.`;

    // Chamar OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const botResponse = openAIData.choices[0].message.content;

    // Salvar conversa no banco
    const sessionId = `session_${userId}_${Date.now()}`;
    const { error: saveError } = await supabase
      .from('ai_chat_messages')
      .insert([
        {
          session_id: sessionId,
          user_id: userId,
          content: message,
          message_type: 'user',
          radcoins_cost: chatCost
        },
        {
          session_id: sessionId,
          user_id: userId,
          content: botResponse,
          message_type: 'assistant',
          radcoins_cost: 0
        }
      ]);

    if (saveError) {
      console.error('Erro ao salvar conversa:', saveError);
    }

    // Detectar se é pedido de report
    const isReportRequest = message.toLowerCase().includes('problema') || 
                           message.toLowerCase().includes('bug') || 
                           message.toLowerCase().includes('erro') ||
                           message.toLowerCase().includes('report');

    let shouldCreateReport = false;
    if (isReportRequest && botResponse.toLowerCase().includes('report')) {
      shouldCreateReport = true;
    }

    return new Response(JSON.stringify({ 
      response: botResponse,
      shouldCreateReport,
      costPaid: chatCost,
      newBalance: (fullProfile?.radcoin_balance || 0) - chatCost
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no RadBot AI:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
