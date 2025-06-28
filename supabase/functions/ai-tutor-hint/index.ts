
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🤖 AI Tutor Hint - Iniciando processamento');
    
    const { caseData, userQuestion } = await req.json();
    
    if (!caseData) {
      throw new Error('Dados do caso não fornecidos');
    }

    console.log('📋 Dados recebidos:', { 
      caseId: caseData.id, 
      userQuestion: userQuestion?.substring(0, 50) + '...' 
    });
    
    // Inicializar Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se usuário tem créditos
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    console.log('👤 Usuário autenticado:', user.id);

    // Verificar créditos disponíveis
    const { data: helpAids, error: helpError } = await supabaseClient
      .from('user_help_aids')
      .select('ai_tutor_credits')
      .eq('user_id', user.id)
      .single();

    if (helpError) {
      console.error('❌ Erro ao buscar créditos:', helpError);
      throw new Error('Erro ao verificar créditos');
    }

    if (!helpAids || helpAids.ai_tutor_credits <= 0) {
      return new Response(
        JSON.stringify({ error: 'Sem créditos de tutor AI disponíveis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('💳 Créditos disponíveis:', helpAids.ai_tutor_credits);

    // Construir prompt para o OpenAI
    const prompt = `Você é um tutor médico especializado. Analise o caso clínico abaixo e forneça uma dica educativa que ajude o estudante a raciocinar sobre o diagnóstico, SEM revelar a resposta diretamente.

CASO CLÍNICO:
- Paciente: ${caseData.patient_age} anos, ${caseData.patient_gender}
- História: ${caseData.patient_clinical_info}
- Achados: ${caseData.findings || 'Não informado'}
- Duração dos sintomas: ${caseData.symptoms_duration || 'Não informado'}
- Modalidade de imagem: ${caseData.modality} ${caseData.subtype ? `(${caseData.subtype})` : ''}

PERGUNTA DO ESTUDANTE: ${userQuestion || 'Geral'}

INSTRUÇÕES:
1. Forneça uma dica que direcione o raciocínio diagnóstico
2. NÃO revele o diagnóstico final
3. Foque em aspectos clínicos, achados de imagem ou fisiopatologia relevantes
4. Use linguagem educativa e encorajadora
5. Máximo 150 palavras
6. Se não houver pergunta específica, dê uma dica geral sobre o que observar

Responda apenas com a dica, sem preâmbulos.`;

    console.log('🧠 Chamando OpenAI...');

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
          {
            role: 'system',
            content: 'Você é um tutor médico especializado em ensinar estudantes através de dicas educativas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('❌ Erro OpenAI:', errorText);
      throw new Error('Erro na chamada do OpenAI');
    }

    const openAIData = await openAIResponse.json();
    const hint = openAIData.choices[0].message.content;

    console.log('✅ Resposta gerada. Tamanho:', hint?.length);

    // Consumir crédito do usuário
    const { error: consumeError } = await supabaseClient.rpc('consume_help_aid', {
      p_user_id: user.id,
      p_aid_type: 'ai_tutor',
      p_amount: 1
    });

    if (consumeError) {
      console.error('❌ Erro ao consumir crédito:', consumeError);
      // Não falhar a operação por causa disso
    } else {
      console.log('💳 Crédito consumido com sucesso');
    }

    // Log da utilização (opcional - pode falhar sem afetar o resultado)
    try {
      await supabaseClient
        .from('ai_tutor_usage_logs')
        .insert({
          user_id: user.id,
          case_id: caseData.id,
          prompt_used: prompt,
          response_text: hint,
          tokens_used: openAIData.usage?.total_tokens || 0,
          config_id: null
        });
    } catch (logError) {
      console.error('⚠️ Erro ao salvar log (não crítico):', logError);
    }

    const finalResponse = {
      hint,
      creditsRemaining: helpAids.ai_tutor_credits - 1,
      success: true
    };

    console.log('🎉 Processamento concluído com sucesso');

    return new Response(
      JSON.stringify(finalResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no tutor AI:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
