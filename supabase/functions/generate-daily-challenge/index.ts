
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PROMPT GLOBAL UNIFICADO - Sistema Inteligente
const GLOBAL_PROMPT_TEMPLATE = `Você é um especialista em medicina que cria questões educativas de verdadeiro/falso para desafios diários.

INSTRUÇÕES PARA GERAÇÃO:
- Crie uma pergunta de VERDADEIRO/FALSO sobre medicina
- Nível de dificuldade: {difficulty}
- Especialidade: {category}
- Modalidade de imagem: {modality}

ESTRUTURA DA QUESTÃO:
1. A pergunta deve ser clinicamente relevante e educativa
2. Apropriada para estudantes de medicina
3. Clara, objetiva e sem ambiguidades
4. Focada em conceitos importantes da especialidade
5. Use terminologia médica adequada ao nível

FORMATO DE RESPOSTA (JSON apenas):
{
  "question": "Pergunta clara e objetiva de verdadeiro/falso",
  "correct_answer": true/false,
  "explanation": "Explicação educativa detalhada de 3-4 frases que ensine o conceito",
  "confidence": 0.95
}

EXEMPLO:
{
  "question": "A radiografia de tórax em PA é o exame de primeira linha para avaliar pneumonia em pacientes adultos.",
  "correct_answer": true,
  "explanation": "A radiografia de tórax em PA (posteroanterior) é realmente o exame inicial de escolha para investigar pneumonia em adultos, pois permite identificar consolidações, infiltrados e outras alterações pulmonares com boa sensibilidade e especificidade. É um exame de baixo custo, amplamente disponível e com dose de radiação relativamente baixa.",
  "confidence": 0.92
}`;

interface GenerateRequest {
  mode?: 'manual' | 'auto';
  category?: string;
  difficulty?: string;
  modality?: string;
}

serve(async (req) => {
  console.log('🎯 Generate Daily Challenge - Iniciando...');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OPENAI_API_KEY não configurada');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'OpenAI API Key não configurada'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData: GenerateRequest = await req.json().catch(() => ({}));
    const mode = requestData.mode || 'manual';

    console.log('📝 Modo de geração:', mode);

    // SELEÇÃO INTELIGENTE DE PARÂMETROS
    let category = requestData.category;
    let difficulty = requestData.difficulty;
    let modality = requestData.modality;

    if (mode === 'auto' || !category) {
      // Buscar especialidades disponíveis
      const { data: specialties } = await supabase
        .from('medical_specialties')
        .select('name')
        .limit(10);

      // Seleção aleatória inteligente
      const availableCategories = specialties?.map(s => s.name) || [
        'Cardiologia', 'Pneumologia', 'Neurologia', 'Radiologia', 'Dermatologia'
      ];
      category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    }

    if (mode === 'auto' || !difficulty) {
      const difficulties = ['Iniciante', 'Intermediário', 'Avançado'];
      difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    }

    if (mode === 'auto' || !modality) {
      const modalities = ['Radiografia', 'Tomografia Computadorizada', 'Ressonância Magnética', 'Ultrassom', 'Exame Clínico'];
      modality = modalities[Math.floor(Math.random() * modalities.length)];
    }

    console.log('🎲 Parâmetros selecionados:', { category, difficulty, modality });

    // CONSTRUIR PROMPT PERSONALIZADO
    const personalizedPrompt = GLOBAL_PROMPT_TEMPLATE
      .replace(/\{category\}/g, category)
      .replace(/\{difficulty\}/g, difficulty)
      .replace(/\{modality\}/g, modality);

    console.log('🤖 Chamando OpenAI API...');

    // CHAMADA PARA OPENAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em medicina que cria questões educativas. Retorne APENAS JSON válido no formato especificado.' 
          },
          { role: 'user', content: personalizedPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content.trim();
    
    console.log('✅ OpenAI Response recebida');

    // PARSE E VALIDAÇÃO DA RESPOSTA
    let parsedResponse;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta:', parseError);
      throw new Error('Resposta da IA inválida');
    }

    // VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS
    if (!parsedResponse.question || 
        typeof parsedResponse.correct_answer !== 'boolean' || 
        !parsedResponse.explanation) {
      console.error('❌ Resposta incompleta:', parsedResponse);
      throw new Error('Resposta da IA incompleta');
    }

    console.log('💾 Salvando questão na base...');

    // AUTO-APROVAÇÃO INTELIGENTE
    const confidence = parsedResponse.confidence || 0.8;
    const autoApprove = confidence >= 0.9 && mode === 'auto';
    const status = autoApprove ? 'approved' : 'draft';

    console.log(`🎯 Confiança: ${confidence}, Auto-aprovação: ${autoApprove}, Status: ${status}`);

    // SALVAR NA BASE DE DADOS
    const { data: question, error: dbError } = await supabase
      .from('daily_quiz_questions')
      .insert({
        question: parsedResponse.question,
        correct_answer: parsedResponse.correct_answer,
        explanation: parsedResponse.explanation,
        status: status,
        generated_by_ai: true,
        ai_confidence: confidence,
        metadata: {
          ai_model: 'gpt-4o-mini',
          generation_mode: mode,
          auto_approved: autoApprove,
          parameters: { category, difficulty, modality },
          raw_response: content,
          generated_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Erro ao salvar questão:', dbError);
      throw new Error('Erro ao salvar questão: ' + dbError.message);
    }

    console.log('✅ Questão salva com sucesso! ID:', question.id);

    return new Response(JSON.stringify({
      success: true,
      question: question,
      auto_approved: autoApprove,
      confidence: confidence,
      parameters: { category, difficulty, modality },
      mode: mode
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ ERRO na geração:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
