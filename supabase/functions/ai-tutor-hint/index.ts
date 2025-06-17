
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
    const { caseData, userQuestion } = await req.json();
    
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

    // Verificar créditos disponíveis
    const { data: helpAids } = await supabaseClient
      .from('user_help_aids')
      .select('ai_tutor_credits')
      .eq('user_id', user.id)
      .single();

    if (!helpAids || helpAids.ai_tutor_credits <= 0) {
      return new Response(
        JSON.stringify({ error: 'Sem créditos de tutor AI disponíveis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      throw new Error('Erro na chamada do OpenAI');
    }

    const openAIData = await openAIResponse.json();
    const hint = openAIData.choices[0].message.content;

    // Consumir crédito do usuário
    const { error: consumeError } = await supabaseClient.rpc('consume_help_aid', {
      p_user_id: user.id,
      p_aid_type: 'ai_tutor',
      p_amount: 1
    });

    if (consumeError) {
      console.error('Erro ao consumir crédito:', consumeError);
    }

    // Log da utilização
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

    return new Response(
      JSON.stringify({ hint, creditsRemaining: helpAids.ai_tutor_credits - 1 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no tutor AI:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
