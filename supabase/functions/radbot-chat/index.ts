
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

    // CORREÇÃO CRÍTICA: Usar 'help_purchase' em vez de 'premium_service'
    const { error: debitError } = await supabase.rpc('award_radcoins', {
      p_user_id: userId,
      p_amount: -chatCost,
      p_transaction_type: 'help_purchase',
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

    // Buscar dados completos do usuário para contexto enriquecido
    const { data: fullProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Buscar progresso detalhado do usuário
    const { data: caseHistory } = await supabase
      .from('user_case_history')
      .select('*')
      .eq('user_id', userId)
      .order('answered_at', { ascending: false })
      .limit(20);

    // Buscar conquistas do usuário
    const { data: achievements } = await supabase
      .from('user_achievements_progress')
      .select(`
        *,
        achievement_system (*)
      `)
      .eq('user_id', userId)
      .eq('is_completed', true)
      .limit(10);

    // Buscar eventos ativos que o usuário pode participar
    const { data: activeEvents } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'ACTIVE')
      .limit(3);

    // Calcular estatísticas do usuário
    const totalCasesResolved = caseHistory?.length || 0;
    const correctAnswers = caseHistory?.filter(h => h.is_correct).length || 0;
    const accuracy = totalCasesResolved > 0 ? Math.round((correctAnswers / totalCasesResolved) * 100) : 0;
    const achievementsCount = achievements?.length || 0;

    // Criar contexto personalizado e enriquecido
    const userContext = `
DADOS DO USUÁRIO:
- Nome: ${fullProfile?.full_name || 'Estudante'}
- Especialidade: ${fullProfile?.medical_specialty || 'Não informada'}
- Estágio acadêmico: ${fullProfile?.academic_stage || 'Não informado'}
- Pontos totais: ${fullProfile?.total_points || 0}
- RadCoins: ${(fullProfile?.radcoin_balance || 0) - chatCost}
- Streak atual: ${fullProfile?.current_streak || 0} dias

PROGRESSO ATUAL:
- Casos resolvidos: ${totalCasesResolved}
- Taxa de acerto: ${accuracy}%
- Conquistas desbloqueadas: ${achievementsCount}
- Último acesso: ${fullProfile?.updated_at || 'Não informado'}

EVENTOS ATIVOS:
${activeEvents?.map(e => `- ${e.name} (${e.participants_count || 0} participantes)`).join('\n') || '- Nenhum evento ativo no momento'}

CONQUISTAS RECENTES:
${achievements?.slice(0, 3).map(a => `- ${a.achievement_system?.name || 'Conquista'}`).join('\n') || '- Nenhuma conquista recente'}
`;

    // Prompt do sistema melhorado e mais contextual
    const systemPrompt = `Você é o RadBot AI, assistente especializado da plataforma RadVenture para estudantes de radiologia médica.

🎯 SUAS 3 FUNÇÕES PRINCIPAIS:

1. **EXPLICAR O FUNCIONAMENTO DO APP RADVENTURE**
   - Rankings, conquistas, pontuação, títulos e eventos
   - Como jogar, enviar casos e ganhar RadCoins
   - Sistema de progressão e recompensas
   - Funcionalidades e navegação

2. **ENSINAR CONCEITOS DE RADIOLOGIA MÉDICA**
   - Base em fontes confiáveis: Radiopaedia.org, CBR, RSNA, ACR
   - Explicações técnicas mas acessíveis
   - Correlações clínico-radiológicas
   - Casos práticos e diagnósticos diferenciais

3. **INTERAGIR COM O PROGRESSO DO USUÁRIO**
   - Análise personalizada do desempenho
   - Sugestões de melhoria baseadas nos dados
   - Incentivo e gamificação
   - Recomendações de casos e especialidades

📊 CONTEXTO ATUAL DO USUÁRIO:
${userContext}

🤖 COMANDOS ESPECIAIS:
- /meus-stats: Análise completa do progresso
- /radcoins: Sistema de moeda virtual
- /eventos: Competições e rankings
- /conquistas: Sistema de badges e recompensas
- /help: Ajuda e funcionalidades

⚡ PERSONALIZAÇÃO INTELIGENTE:
- Se accuracy < 70%: Ofereça dicas de estudo
- Se streak >= 7: Parabenize pela consistência  
- Se poucos RadCoins: Explique como ganhar mais
- Se muitas conquistas: Desafie com casos avançados
- Se eventos ativos: Incentive participação

🔍 DETECÇÃO AUTOMÁTICA DE REPORTS:
- Palavras-chave: "problema", "bug", "erro", "não funciona", "travou"
- Se detectado: Sugira criar report automaticamente
- Colete detalhes específicos do problema

💡 ESTILO DE COMUNICAÇÃO:
- Use emojis médicos: 🩺🔬💊🧬⚡📋🏆
- Linguagem técnica mas acessível
- Respostas concisas e objetivas
- Cite fontes quando apropriado
- Mantenha tom encorajador e educativo

⚠️ DISCLAIMER OBRIGATÓRIO:
Sempre lembre que suas informações são educacionais e não substituem consulta médica profissional.

🎯 RESPOSTA CONTEXTUAL:
Baseie suas respostas no progresso atual do usuário mostrado acima. Se ele tem poucos casos resolvidos, seja mais introdutório. Se tem muitas conquistas, seja mais avançado.`;

    // Chamar OpenAI com modelo otimizado
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
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const botResponse = openAIData.choices[0].message.content;

    // Salvar conversa no banco com mais metadados
    const sessionId = `session_${userId}_${Date.now()}`;
    const { error: saveError } = await supabase
      .from('ai_chat_messages')
      .insert([
        {
          session_id: sessionId,
          user_id: userId,
          content: message,
          message_type: 'user',
          radcoins_cost: chatCost,
          context_data: {
            user_stats: {
              total_points: fullProfile?.total_points || 0,
              cases_resolved: totalCasesResolved,
              accuracy: accuracy,
              streak: fullProfile?.current_streak || 0
            }
          }
        },
        {
          session_id: sessionId,
          user_id: userId,
          content: botResponse,
          message_type: 'assistant',
          radcoins_cost: 0,
          context_data: {
            openai_model: 'gpt-4o-mini',
            response_tokens: openAIData.usage?.completion_tokens || 0
          }
        }
      ]);

    if (saveError) {
      console.error('Erro ao salvar conversa:', saveError);
    }

    // Detecção automática melhorada de reports
    const reportKeywords = ['problema', 'bug', 'erro', 'não funciona', 'travou', 'quebrou', 'falha', 'defeito'];
    const isReportRequest = reportKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    let shouldCreateReport = false;
    if (isReportRequest && botResponse.toLowerCase().includes('report')) {
      shouldCreateReport = true;
    }

    return new Response(JSON.stringify({ 
      response: botResponse,
      shouldCreateReport,
      costPaid: chatCost,
      newBalance: (fullProfile?.radcoin_balance || 0) - chatCost,
      userStats: {
        casesResolved: totalCasesResolved,
        accuracy: accuracy,
        achievements: achievementsCount,
        streak: fullProfile?.current_streak || 0
      }
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
