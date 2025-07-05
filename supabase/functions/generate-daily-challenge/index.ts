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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { mode, action, count = 1 } = body;
    
    console.log('🤖 Generate Daily Challenge - Action:', action, 'Mode:', mode, 'Count:', count);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Ação: Gerar lote semanal de questões
    if (action === 'weekly_batch') {
      console.log(`📅 Gerando lote semanal de ${count} questões`);
      const results = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const result = await generateSingleQuestion(supabase);
          results.push(result);
          console.log(`✅ Questão ${i + 1}/${count} gerada`);
          
          // Delay entre gerações para evitar rate limiting
          if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`❌ Erro na questão ${i + 1}:`, error);
          results.push({ error: error.message });
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          results,
          generated_count: results.filter(r => !r.error).length,
          total_requested: count
        }),
        { headers: corsHeaders }
      );
    }

    // Ação: Manter pool de questões
    if (action === 'maintain_pool') {
      const { data: poolStatus } = await supabase.rpc('get_daily_challenge_pool_status');
      
      console.log('🔍 Status do pool:', poolStatus);
      
      if (poolStatus.pool_health === 'critical' || poolStatus.approved_questions < 5) {
        console.log('⚠️ Pool crítico, gerando questões de emergência');
        const emergencyCount = 7 - poolStatus.approved_questions;
        
        const results = [];
        for (let i = 0; i < emergencyCount; i++) {
          try {
            const result = await generateSingleQuestion(supabase);
            results.push(result);
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (error) {
            console.error(`❌ Erro na questão de emergência ${i + 1}:`, error);
          }
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            action: 'pool_maintenance',
            generated_count: results.length,
            pool_status_before: poolStatus,
            emergency_generation: true
          }),
          { headers: corsHeaders }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          action: 'pool_maintenance',
          pool_status: poolStatus,
          maintenance_needed: false
        }),
        { headers: corsHeaders }
      );
    }

    // Ação padrão: Gerar questão única
    const result = await generateSingleQuestion(supabase);
    
    return new Response(
      JSON.stringify({
        success: true,
        ...result
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// Função auxiliar para gerar uma única questão
async function generateSingleQuestion(supabase: any) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API Key não configurada');
  }

  // Selecionar especialidade aleatória
  const specialties = ['Radiologia', 'Cardiologia', 'Neurologia', 'Ortopedia', 'Gastroenterologia'];
  const selectedSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
  
  console.log(`🎯 Especialidade selecionada: ${selectedSpecialty}`);

  // Prompt global unificado
  const prompt = `Crie uma questão de múltipla escolha para ${selectedSpecialty} seguindo EXATAMENTE este formato JSON:

{
  "question": "Pergunta clara e objetiva sobre um caso clínico real",
  "correct_answer": true,
  "explanation": "Explicação detalhada da resposta correta com fundamentos médicos"
}

REGRAS IMPORTANTES:
- Pergunta deve ser Verdadeiro/Falso
- Use casos clínicos reais e relevantes
- Explanation deve ser educativa e completa
- Foque em conceitos importantes da especialidade
- Evite pegadinhas, seja didático

Especialidade: ${selectedSpecialty}`;

  console.log('📝 Chamando OpenAI...');

  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: 'Você é um especialista em educação médica. Crie questões didáticas e precisas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!openAIResponse.ok) {
    throw new Error(`OpenAI API error: ${openAIResponse.status}`);
  }

  const openAIData = await openAIResponse.json();
  const generatedContent = openAIData.choices[0].message.content;
  
  console.log('🎯 Conteúdo gerado:', generatedContent);

  // Parse do JSON
  let parsedContent;
  try {
    // Limpar o conteúdo e extrair JSON
    const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Nenhum JSON válido encontrado na resposta');
    }
    parsedContent = JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error('❌ Erro ao fazer parse do JSON:', parseError);
    throw new Error('Resposta da IA não está em formato JSON válido');
  }

  // Validação
  if (!parsedContent.question || !parsedContent.explanation || typeof parsedContent.correct_answer !== 'boolean') {
    throw new Error('JSON gerado não possui todos os campos obrigatórios');
  }

  // Calcular confiança baseada na qualidade da resposta
  let confidence = 0.75; // Base
  if (parsedContent.explanation.length > 100) confidence += 0.1;
  if (parsedContent.question.length > 50) confidence += 0.05;
  if (parsedContent.question.includes('?')) confidence += 0.05;
  
  confidence = Math.min(confidence, 0.99);

  console.log(`📊 Confiança calculada: ${confidence}`);

  // Determinar status baseado na confiança
  const status = confidence >= 0.9 ? 'approved' : 'pending';
  
  // Salvar no banco
  const { data: savedQuestion, error: saveError } = await supabase
    .from('daily_quiz_questions')
    .insert({
      question: parsedContent.question,
      correct_answer: parsedContent.correct_answer,
      explanation: parsedContent.explanation,
      status: status,
      generated_by_ai: true,
      ai_confidence: confidence,
      metadata: {
        specialty: selectedSpecialty,
        generated_at: new Date().toISOString(),
        auto_approved: status === 'approved'
      }
    })
    .select()
    .single();

  if (saveError) {
    console.error('❌ Erro ao salvar questão:', saveError);
    throw new Error('Erro ao salvar questão no banco de dados');
  }

  console.log('✅ Questão salva com sucesso:', savedQuestion.id);

  // Log da operação
  await supabase
    .from('automation_logs')
    .insert({
      operation_type: 'question_generation',
      status: 'success',
      details: {
        question_id: savedQuestion.id,
        specialty: selectedSpecialty,
        confidence: confidence,
        auto_approved: status === 'approved'
      }
    });

  return {
    question: savedQuestion,
    auto_approved: status === 'approved',
    confidence: confidence,
    specialty: selectedSpecialty
  };
}