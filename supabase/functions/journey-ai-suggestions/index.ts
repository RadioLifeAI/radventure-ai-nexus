
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, filters, context } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = '';
    
    if (type === 'autofill') {
      prompt = `
Você é um especialista em educação médica criando jornadas de aprendizado personalizadas.

CONTEXTO: ${context || 'Criar uma jornada de aprendizado médico'}

FILTROS ATUAIS:
- Especialidade: ${filters.specialty || 'Não especificada'}
- Modalidade: ${filters.modality || 'Não especificada'}  
- Subtipo: ${filters.subtype || 'Não especificado'}
- Dificuldade: ${filters.difficulty || 'Não especificada'}
- Idade do Paciente: ${filters.patientAge || 'Não especificada'}
- Gênero: ${filters.patientGender || 'Não especificado'}
- Duração dos Sintomas: ${filters.symptomsDuration || 'Não especificada'}

INSTRUÇÕES:
1. Crie um título atrativo e específico para a jornada
2. Escreva uma descrição envolvente (150-300 caracteres)
3. Defina 3-5 objetivos de aprendizado específicos e mensuráveis
4. Sugira filtros otimizados baseados no contexto
5. Estime duração e número recomendado de casos

RESPONDA APENAS COM JSON VÁLIDO (sem markdown, sem \`\`\`json):
{
  "title": "Título específico e atrativo",
  "description": "Descrição clara dos objetivos da jornada",
  "objectives": [
    "Objetivo específico 1",
    "Objetivo específico 2", 
    "Objetivo específico 3"
  ],
  "suggestedFilters": {
    "specialty": "Especialidade sugerida",
    "modality": "Modalidade sugerida",
    "subtype": "Subtipo sugerido",
    "difficulty": "Nível de dificuldade",
    "patientAge": "Faixa etária sugerida",
    "patientGender": "Gênero sugerido",
    "symptomsDuration": "Duração sugerida"
  },
  "estimatedDuration": 45,
  "recommendedCaseCount": 9
}
`;
    }

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
            content: 'Você é um especialista em educação médica. Responda APENAS com JSON válido, sem markdown ou formatação adicional.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    console.log('Raw AI response:', content);
    
    // Limpar markdown se presente
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/\n?```$/g, '');
    }
    if (content.startsWith('```')) {
      content = content.replace(/```\n?/g, '').replace(/\n?```$/g, '');
    }
    
    // Parse do JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      
      // Fallback com dados padrão
      parsedContent = {
        title: 'Jornada Personalizada de Aprendizado',
        description: 'Explore casos médicos selecionados para aprimorar seus conhecimentos clínicos',
        objectives: [
          'Desenvolver raciocínio clínico',
          'Praticar diagnóstico diferencial',
          'Melhorar tomada de decisão médica'
        ],
        suggestedFilters: {
          specialty: filters.specialty || 'Medicina Geral',
          modality: filters.modality || 'Geral',
          difficulty: 'Intermediário'
        },
        estimatedDuration: 30,
        recommendedCaseCount: 8
      };
    }

    // Validações de segurança
    if (!parsedContent.title) {
      parsedContent.title = 'Jornada de Aprendizado Médico';
    }
    if (!parsedContent.description) {
      parsedContent.description = 'Trilha educativa para desenvolver competências clínicas';
    }
    if (!Array.isArray(parsedContent.objectives) || parsedContent.objectives.length === 0) {
      parsedContent.objectives = ['Desenvolver conhecimento clínico', 'Praticar diagnóstico', 'Melhorar decisão médica'];
    }

    // Garantir valores padrão
    parsedContent.estimatedDuration = parsedContent.estimatedDuration || 30;
    parsedContent.recommendedCaseCount = parsedContent.recommendedCaseCount || 6;
    parsedContent.suggestedFilters = parsedContent.suggestedFilters || {};

    console.log('Processed AI response:', parsedContent);

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in journey-ai-suggestions function:', error);
    
    // Retornar dados padrão em caso de erro
    const fallbackData = {
      title: 'Jornada Personalizada',
      description: 'Explore casos médicos selecionados para seu aprendizado',
      objectives: ['Desenvolver conhecimento clínico', 'Praticar diagnóstico', 'Melhorar tomada de decisão'],
      suggestedFilters: {},
      estimatedDuration: 30,
      recommendedCaseCount: 6
    };
    
    return new Response(JSON.stringify(fallbackData), {
      status: 200, // Retornar 200 com dados padrão ao invés de erro
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
