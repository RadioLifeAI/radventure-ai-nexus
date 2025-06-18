
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaseData {
  title?: string;
  findings?: string;
  patient_clinical_info?: string;
  modality?: string;
  specialty?: string;
  primary_diagnosis?: string;
  main_symptoms?: string[];
  anatomical_regions?: string[];
  pathology_types?: string[];
  clinical_presentation_tags?: string[];
  case_complexity_factors?: string[];
  learning_objectives?: string[];
  search_keywords?: string[];
}

const RADIOLOGY_TEMPLATE_PROMPT = `
Você é um radiologista especialista que deve preencher automaticamente campos estruturados para um caso médico radiológico.

Baseado na modalidade e contexto fornecido, preencha TODOS os campos possíveis usando conhecimento médico especializado:

REGRAS ESPECÍFICAS:
- Para TC de Trauma: foque em lesões agudas, múltiplas regiões, urgência
- Para RX Tórax: foque em patologias pulmonares comuns, consolidações
- Para RM Neurológica: foque em patologias complexas, múltiplas sequências
- Para US Abdome: foque em órgãos sólidos, vesícula, rins
- Para Mamografia: foque em screening, lesões mamárias, BI-RADS
- Para RX Ortopédico: foque em fraturas, articulações, trauma

CONTEXTO DO CASO:
Modalidade: {modality}
Especialidade: {specialty}
Contexto: {context}
Título: {title}

PREENCHA TODOS OS CAMPOS EM FORMATO JSON:
{
  "primary_diagnosis": "Diagnóstico principal específico",
  "secondary_diagnoses": ["Diagnóstico diferencial 1", "Diagnóstico diferencial 2"],
  "case_classification": "diagnostico|diferencial|emergencial|didatico",
  "anatomical_regions": ["Região anatômica específica"],
  "finding_types": ["Tipo de achado radiológico"],
  "pathology_types": ["Tipo de patologia"],
  "main_symptoms": ["Sintoma principal", "Sintoma secundário"],
  "clinical_presentation_tags": ["Tag de apresentação"],
  "case_complexity_factors": ["Fator de complexidade"],
  "learning_objectives": ["Objetivo educacional 1", "Objetivo 2"],
  "search_keywords": ["palavra-chave1", "palavra-chave2"],
  "case_rarity": "comum|raro|muito_raro",
  "educational_value": 7,
  "clinical_relevance": 8,
  "estimated_solve_time": 5,
  "exam_context": "rotina|urgencia|uti|ambulatorio",
  "target_audience": ["Graduação", "Residência R1"],
  "laterality": "bilateral|direito|esquerdo|central",
  "cid10_code": "Código CID-10 se aplicável"
}
`;

const SMART_AUTOFILL_PROMPT = `
Você é um especialista em radiologia que deve analisar o caso fornecido e sugerir melhorias inteligentes.

ANALISE O CASO ATUAL:
{caseData}

FORNEÇA SUGESTÕES INTELIGENTES:
1. Campos vazios que podem ser preenchidos
2. Inconsistências detectadas
3. Sugestões de melhoria
4. Campos relacionados que devem ser preenchidos

RETORNE EM FORMATO JSON:
{
  "suggestions": {
    "missing_fields": ["campo1", "campo2"],
    "inconsistencies": ["inconsistência detectada"],
    "improvements": ["sugestão de melhoria"],
    "related_fields": {
      "campo": "valor sugerido"
    }
  },
  "autofill_data": {
    // Novos campos preenchidos automaticamente
  }
}
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseData, action = 'smart_autofill', templateType = 'generic' } = await req.json();
    console.log('🚀 Received case autofill request:', { action, templateType });

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = '';
    let responseFormat = 'json_object';

    switch (action) {
      case 'template_autofill':
        prompt = buildTemplateAutofillPrompt(caseData, templateType);
        break;
      case 'smart_suggestions':
        prompt = buildSmartSuggestionsPrompt(caseData);
        break;
      case 'field_completion':
        prompt = buildFieldCompletionPrompt(caseData);
        break;
      case 'consistency_check':
        prompt = buildConsistencyCheckPrompt(caseData);
        break;
      default:
        prompt = buildSmartAutofillPrompt(caseData);
    }

    console.log('📝 Generated prompt for action:', action);

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um radiologista especialista que auxilia na criação de casos médicos estruturados e educacionais.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: responseFormat },
        max_tokens: 2500,
        temperature: 0.3
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('✅ OpenAI response received');

    const content = openaiData.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let suggestions;
    try {
      suggestions = JSON.parse(content);
      console.log('📊 Parsed suggestions:', suggestions);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Raw content:', content);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('💥 Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

function buildTemplateAutofillPrompt(caseData: CaseData, templateType: string): string {
  const contextMap = {
    'trauma_tc': 'TC de Trauma - Emergência',
    'pneumonia_rx': 'RX Tórax - Pneumonia',
    'fratura_membro': 'RX Ortopédico - Fratura',
    'rm_neurologico': 'RM Neurológica - Avançado',
    'abdome_tc': 'TC Abdome - Diagnóstico',
    'caso_raro': 'Caso Raro - Especializado'
  };

  return RADIOLOGY_TEMPLATE_PROMPT
    .replace('{modality}', caseData.modality || 'Não especificado')
    .replace('{specialty}', caseData.specialty || 'Radiologia')
    .replace('{context}', contextMap[templateType] || 'Geral')
    .replace('{title}', caseData.title || 'Não especificado');
}

function buildSmartAutofillPrompt(caseData: CaseData): string {
  return SMART_AUTOFILL_PROMPT.replace('{caseData}', JSON.stringify(caseData, null, 2));
}

function buildSmartSuggestionsPrompt(caseData: CaseData): string {
  return `
Analise este caso radiológico e forneça sugestões inteligentes para melhorar a qualidade:

CASO ATUAL:
${JSON.stringify(caseData, null, 2)}

FORNEÇA SUGESTÕES EM JSON:
{
  "quality_score": 85,
  "missing_critical": ["campos críticos não preenchidos"],
  "suggestions": ["sugestão específica 1", "sugestão 2"],
  "auto_suggestions": {
    "campo": "valor sugerido"
  },
  "consistency_alerts": ["alerta de consistência"]
}
`;
}

function buildFieldCompletionPrompt(caseData: CaseData): string {
  return `
Complete automaticamente os campos vazios deste caso radiológico:

DADOS ATUAIS:
${JSON.stringify(caseData, null, 2)}

PREENCHA CAMPOS VAZIOS COM BASE NO CONTEXTO EXISTENTE:
{
  "completed_fields": {
    // Apenas campos que estavam vazios
  },
  "confidence_scores": {
    "campo": 0.95
  }
}
`;
}

function buildConsistencyCheckPrompt(caseData: CaseData): string {
  return `
Verifique a consistência deste caso radiológico:

DADOS:
${JSON.stringify(caseData, null, 2)}

ANALISE CONSISTÊNCIA:
{
  "consistency_score": 90,
  "issues": [
    {
      "field": "campo_problema",
      "issue": "descrição do problema",
      "suggestion": "sugestão de correção"
    }
  ],
  "improvements": ["melhoria sugerida"]
}
`;
}
