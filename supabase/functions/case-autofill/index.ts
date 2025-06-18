
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

const STRUCTURED_EXTRACTION_PROMPT = `
Você é um especialista em radiologia que deve extrair informações estruturadas de casos médicos radiológicos.

Analise o seguinte caso e extraia as informações estruturadas em formato JSON:

REGRAS:
- Seja preciso e use terminologia médica correta
- Para arrays, retorne sempre arrays, mesmo que vazios
- Use termos em português brasileiro
- Para regiões anatômicas, seja específico (ex: "Pulmão direito", "Lobo superior esquerdo")
- Para tipos de patologia, use classificações padrão (ex: "Infeccioso", "Neoplásico", "Inflamatório")

FORMATO DE RESPOSTA (JSON válido):
{
  "primary_diagnosis": "Diagnóstico principal claro e específico",
  "secondary_diagnoses": ["Diagnóstico diferencial 1", "Diagnóstico diferencial 2"],
  "anatomical_regions": ["Região anatômica 1", "Região anatômica 2"],
  "finding_types": ["Tipo de achado 1", "Tipo de achado 2"],
  "laterality": "bilateral|direito|esquerdo|central",
  "main_symptoms": ["Sintoma 1", "Sintoma 2"],
  "pathology_types": ["Tipo de patologia 1"],
  "clinical_presentation_tags": ["Tag de apresentação 1", "Tag 2"],
  "case_complexity_factors": ["Fator de complexidade 1"],
  "learning_objectives": ["Objetivo de aprendizado 1", "Objetivo 2"],
  "search_keywords": ["palavra-chave1", "palavra-chave2"],
  "case_classification": "diagnostico|diferencial|emergencial|didatico",
  "case_rarity": "comum|raro|muito_raro",
  "educational_value": 5,
  "clinical_relevance": 5,
  "estimated_solve_time": 5,
  "exam_context": "rotina|urgencia|uti|ambulatorio",
  "target_audience": ["Graduação", "Residência R1"]
}

DADOS DO CASO:
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseData, action = 'full_autofill' } = await req.json();
    console.log('🚀 Received case data:', caseData);
    console.log('🎯 Action requested:', action);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = '';
    let responseFormat = 'json_object';

    switch (action) {
      case 'extract_structured':
        prompt = buildStructuredExtractionPrompt(caseData);
        break;
      case 'suggest_keywords':
        prompt = buildKeywordsPrompt(caseData);
        responseFormat = 'text';
        break;
      case 'classify_complexity':
        prompt = buildComplexityPrompt(caseData);
        break;
      case 'suggest_learning_objectives':
        prompt = buildLearningObjectivesPrompt(caseData);
        break;
      default:
        prompt = buildFullAutofillPrompt(caseData);
    }

    console.log('📝 Generated prompt:', prompt.substring(0, 200) + '...');

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
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: responseFormat },
        max_tokens: 2000,
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
    if (responseFormat === 'json_object') {
      try {
        suggestions = JSON.parse(content);
        console.log('📊 Parsed suggestions:', suggestions);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('Raw content:', content);
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    } else {
      suggestions = { content };
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

function buildStructuredExtractionPrompt(caseData: CaseData): string {
  return `${STRUCTURED_EXTRACTION_PROMPT}
Título: ${caseData.title || 'Não informado'}
Modalidade: ${caseData.modality || 'Não informado'}
Especialidade: ${caseData.specialty || 'Não informado'}
Achados: ${caseData.findings || 'Não informado'}
Informações Clínicas: ${caseData.patient_clinical_info || 'Não informado'}
Diagnóstico Atual: ${caseData.primary_diagnosis || caseData.diagnosis_internal || 'Não informado'}

Extraia TODAS as informações estruturadas possíveis em formato JSON válido.`;
}

function buildKeywordsPrompt(caseData: CaseData): string {
  return `Gere palavras-chave para busca deste caso radiológico.

CASO:
Título: ${caseData.title || 'Não informado'}
Modalidade: ${caseData.modality || 'Não informado'}
Achados: ${caseData.findings || 'Não informado'}
Diagnóstico: ${caseData.primary_diagnosis || 'Não informado'}

Retorne 10-15 palavras-chave relevantes separadas por vírgula, incluindo:
- Termos médicos específicos
- Modalidade de imagem
- Região anatômica
- Patologia
- Sintomas relacionados

Exemplo: pneumonia, consolidação, radiografia, tórax, pulmão, infecção, febre, dispneia`;
}

function buildComplexityPrompt(caseData: CaseData): string {
  return `Analise a complexidade deste caso radiológico e classifique.

CASO:
${JSON.stringify(caseData, null, 2)}

Retorne um JSON com:
{
  "case_rarity": "comum|raro|muito_raro",
  "educational_value": 1-10,
  "clinical_relevance": 1-10,
  "estimated_solve_time": minutos,
  "case_complexity_factors": ["fator1", "fator2"],
  "target_audience": ["público1", "público2"]
}`;
}

function buildLearningObjectivesPrompt(caseData: CaseData): string {
  return `Crie objetivos de aprendizado para este caso radiológico.

CASO:
${JSON.stringify(caseData, null, 2)}

Retorne um JSON com:
{
  "learning_objectives": ["objetivo1", "objetivo2", "objetivo3"],
  "clinical_presentation_tags": ["tag1", "tag2"],
  "differential_diagnoses": ["diagnóstico1", "diagnóstico2"]
}

Os objetivos devem ser específicos, mensuráveis e educacionalmente relevantes.`;
}

function buildFullAutofillPrompt(caseData: CaseData): string {
  return `${STRUCTURED_EXTRACTION_PROMPT}

CASO COMPLETO:
${JSON.stringify(caseData, null, 2)}

Preencha TODOS os campos estruturados possíveis baseado nas informações disponíveis.
Se algum campo não puder ser determinado, use um valor padrão apropriado.`;
}
