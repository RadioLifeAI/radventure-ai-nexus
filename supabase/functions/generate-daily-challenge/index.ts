import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  promptControlId: string;
  promptTemplate: string;
  category: string;
  difficulty: string;
  modality: string;
}

serve(async (req) => {
  console.log('🎯 Iniciando generate-daily-challenge...');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OPENAI_API_KEY não configurada');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'OpenAI API Key não configurada. Configure em Supabase Edge Function Secrets.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ OpenAI API Key encontrada');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { promptControlId, promptTemplate, category, difficulty, modality }: GenerateRequest = await req.json();

    console.log('📝 Gerando questão:', { 
      promptControlId, 
      category, 
      difficulty, 
      modality,
      templateLength: promptTemplate?.length || 0
    });

    // Construir prompt específico
    const systemPrompt = `Você é um especialista em medicina que cria perguntas de verdadeiro/falso para desafios diários educacionais.

INSTRUÇÕES IMPORTANTES:
- Crie uma pergunta VERDADEIRO/FALSO sobre ${category} com dificuldade ${difficulty} relacionada a ${modality}
- A pergunta deve ser clara, objetiva e educativa
- Forneça uma explicação detalhada que ensine o conceito
- Retorne APENAS um JSON válido no formato especificado
- NÃO inclua texto adicional antes ou depois do JSON

FORMATO DE RESPOSTA (JSON):
{
  "question": "Pergunta clara e objetiva de verdadeiro/falso",
  "correct_answer": true/false,
  "explanation": "Explicação detalhada educativa de 3-4 frases",
  "confidence": 0.95
}`;

    const userPrompt = promptTemplate.replace(/\{category\}/g, category)
                                  .replace(/\{difficulty\}/g, difficulty)
                                  .replace(/\{modality\}/g, modality);

    console.log('🤖 Chamando OpenAI API...');

    // Chamar OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content.trim();
    
    console.log('✅ OpenAI Response recebida. Content length:', content.length);

    // Parse da resposta da IA
    let parsedResponse;
    try {
      // Tentar extrair JSON se houver texto extra
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', parseError);
      throw new Error('Resposta da IA inválida - não foi possível parsear JSON');
    }

    // Validar estrutura da resposta
    if (!parsedResponse.question || typeof parsedResponse.correct_answer !== 'boolean' || !parsedResponse.explanation) {
      console.error('Resposta incompleta:', parsedResponse);
      throw new Error('Resposta da IA incompleta - campos obrigatórios ausentes');
    }

    console.log('💾 Salvando questão na base de dados...');

    // Salvar questão gerada na base de dados
    const { data: question, error: dbError } = await supabase
      .from('daily_quiz_questions')
      .insert({
        prompt_control_id: promptControlId,
        question: parsedResponse.question,
        correct_answer: parsedResponse.correct_answer,
        explanation: parsedResponse.explanation,
        status: 'draft',
        generated_by_ai: true,
        ai_confidence: parsedResponse.confidence || 0.8,
        metadata: {
          ai_model: 'gpt-4o-mini',
          generation_params: { category, difficulty, modality },
          raw_response: content
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar questão:', dbError);
      throw new Error('Erro ao salvar questão no banco de dados: ' + dbError.message);
    }

    // Atualizar contador de uso do prompt
    await supabase
      .from('quiz_prompt_controls')
      .update({ 
        usage_count: supabase.sql`usage_count + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptControlId);

    console.log('✅ Questão criada com sucesso! ID:', question.id);

    return new Response(JSON.stringify({
      success: true,
      question: question,
      ai_response: parsedResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ ERRO na geração de questão:', error);
    console.error('Stack trace:', error.stack);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});