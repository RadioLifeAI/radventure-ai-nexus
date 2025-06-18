
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

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

// Inicializar cliente Supabase para buscar dados
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Cache de dados para performance
let dataCache: {
  specialties: any[];
  modalities: any[];
  subtypes: any[];
  difficulties: any[];
  lastUpdated: number;
} | null = null;

async function loadDatabaseData() {
  const now = Date.now();
  
  // Usar cache se for recente (5 minutos)
  if (dataCache && (now - dataCache.lastUpdated) < 5 * 60 * 1000) {
    return dataCache;
  }

  try {
    console.log('🔄 Carregando dados do banco...');
    
    const [specialtiesResult, modalitiesResult, subtypesResult, difficultiesResult] = await Promise.all([
      supabase.from('medical_specialties').select('id, name').order('name'),
      supabase.from('imaging_modalities').select('id, name').order('name'),
      supabase.from('imaging_subtypes').select('id, name, modality_name').order('name'),
      supabase.from('difficulties').select('id, level, description').order('level')
    ]);

    if (specialtiesResult.error) throw specialtiesResult.error;
    if (modalitiesResult.error) throw modalitiesResult.error;
    if (subtypesResult.error) throw subtypesResult.error;
    if (difficultiesResult.error) throw difficultiesResult.error;

    dataCache = {
      specialties: specialtiesResult.data || [],
      modalities: modalitiesResult.data || [],
      subtypes: subtypesResult.data || [],
      difficulties: difficultiesResult.data || [],
      lastUpdated: now
    };

    console.log(`✅ Dados carregados: ${dataCache.specialties.length} especialidades, ${dataCache.modalities.length} modalidades`);
    return dataCache;
  } catch (error) {
    console.error('❌ Erro ao carregar dados do banco:', error);
    throw error;
  }
}

const ENHANCED_RADIOLOGY_TEMPLATE_PROMPT = `
Você é um radiologista especialista que deve preencher automaticamente campos estruturados para um caso médico radiológico usando DADOS REAIS DO BANCO DE DADOS.

DADOS DISPONÍVEIS NO BANCO:
Especialidades: {specialties}
Modalidades: {modalities}  
Subtipos: {subtypes}
Dificuldades: {difficulties}

REGRAS IMPORTANTES:
1. Use EXATAMENTE os nomes das especialidades, modalidades e subtipos listados acima
2. Para category_id: retorne o ID numérico da especialidade
3. Para difficulty_level: retorne o número do nível (1-4)
4. Para modalidade/subtipo: use os nomes exatos do banco
5. Garanta que modalidade e subtipo sejam compatíveis

CONTEXTO DO CASO:
Modalidade: {modality}
Especialidade: {specialty}
Contexto: {context}
Título: {title}

PREENCHA EM FORMATO JSON VÁLIDO:
{
  "category_id": ID_NUMERICO_ESPECIALIDADE,
  "difficulty_level": NUMERO_1_A_4,
  "points": PONTOS_BASEADOS_NA_DIFICULDADE,
  "modality": "NOME_EXATO_DA_MODALIDADE",
  "subtype": "NOME_EXATO_DO_SUBTIPO",
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
Você é um especialista em radiologia que deve analisar o caso fornecido e sugerir melhorias inteligentes usando DADOS REAIS DO BANCO.

DADOS DISPONÍVEIS:
Especialidades: {specialties}
Modalidades: {modalities}
Subtipos: {subtypes}

ANALISE O CASO ATUAL:
{caseData}

FORNEÇA SUGESTÕES INTELIGENTES EM JSON:
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
    "category_id": ID_NUMERICO,
    "difficulty_level": NUMERO_1_A_4,
    "modality": "NOME_EXATO_MODALIDADE",
    "subtype": "NOME_EXATO_SUBTIPO",
    // outros campos preenchidos automaticamente
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

    // Carregar dados do banco
    const dbData = await loadDatabaseData();

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = '';
    let responseFormat = 'json_object';

    switch (action) {
      case 'template_autofill':
        prompt = buildTemplateAutofillPrompt(caseData, templateType, dbData);
        break;
      case 'smart_suggestions':
        prompt = buildSmartSuggestionsPrompt(caseData, dbData);
        break;
      case 'field_completion':
        prompt = buildFieldCompletionPrompt(caseData, dbData);
        break;
      case 'consistency_check':
        prompt = buildConsistencyCheckPrompt(caseData, dbData);
        break;
      default:
        prompt = buildSmartAutofillPrompt(caseData, dbData);
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
            content: 'Você é um radiologista especialista que auxilia na criação de casos médicos estruturados e educacionais. Retorne sempre um JSON válido.'
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

function buildTemplateAutofillPrompt(caseData: CaseData, templateType: string, dbData: any): string {
  const contextMap = {
    'trauma_tc': 'TC de Trauma - Emergência',
    'pneumonia_rx': 'RX Tórax - Pneumonia',
    'fratura_membro': 'RX Ortopédico - Fratura',
    'rm_neurologico': 'RM Neurológica - Avançado',
    'abdome_tc': 'TC Abdome - Diagnóstico',
    'caso_raro': 'Caso Raro - Especializado'
  };

  return ENHANCED_RADIOLOGY_TEMPLATE_PROMPT
    .replace('{specialties}', JSON.stringify(dbData.specialties))
    .replace('{modalities}', JSON.stringify(dbData.modalities))
    .replace('{subtypes}', JSON.stringify(dbData.subtypes))
    .replace('{difficulties}', JSON.stringify(dbData.difficulties))
    .replace('{modality}', caseData.modality || 'Não especificado')
    .replace('{specialty}', caseData.specialty || 'Radiologia')
    .replace('{context}', contextMap[templateType] || 'Geral')
    .replace('{title}', caseData.title || 'Não especificado');
}

function buildSmartAutofillPrompt(caseData: CaseData, dbData: any): string {
  return SMART_AUTOFILL_PROMPT
    .replace('{specialties}', JSON.stringify(dbData.specialties))
    .replace('{modalities}', JSON.stringify(dbData.modalities))
    .replace('{subtypes}', JSON.stringify(dbData.subtypes))
    .replace('{caseData}', JSON.stringify(caseData, null, 2));
}

function buildSmartSuggestionsPrompt(caseData: CaseData, dbData: any): string {
  return `
Analise este caso radiológico e forneça sugestões inteligentes usando dados reais do banco:

DADOS DO BANCO:
Especialidades: ${JSON.stringify(dbData.specialties)}
Modalidades: ${JSON.stringify(dbData.modalities)}

CASO ATUAL:
${JSON.stringify(caseData, null, 2)}

FORNEÇA SUGESTÕES EM JSON:
{
  "quality_score": 85,
  "missing_critical": ["campos críticos não preenchidos"],
  "suggestions": ["sugestão específica 1", "sugestão 2"],
  "auto_suggestions": {
    "campo": "valor sugerido usando dados do banco"
  },
  "consistency_alerts": ["alerta de consistência"]
}
`;
}

function buildFieldCompletionPrompt(caseData: CaseData, dbData: any): string {
  return `
Complete automaticamente os campos vazios deste caso radiológico usando dados do banco:

DADOS DISPONÍVEIS:
${JSON.stringify(dbData, null, 2)}

DADOS ATUAIS:
${JSON.stringify(caseData, null, 2)}

COMPLETE CAMPOS VAZIOS EM JSON:
{
  "completed_fields": {
    // Apenas campos que estavam vazios, usando dados exatos do banco
  },
  "confidence_scores": {
    "campo": 0.95
  }
}
`;
}

function buildConsistencyCheckPrompt(caseData: CaseData, dbData: any): string {
  return `
Verifique a consistência deste caso radiológico com os dados do banco:

DADOS DO BANCO:
${JSON.stringify(dbData, null, 2)}

DADOS:
${JSON.stringify(caseData, null, 2)}

ANALISE CONSISTÊNCIA EM JSON:
{
  "consistency_score": 90,
  "issues": [
    {
      "field": "campo_problema",
      "issue": "descrição do problema",
      "suggestion": "sugestão de correção usando dados do banco"
    }
  ],
  "improvements": ["melhoria sugerida"]
}
`;
}
