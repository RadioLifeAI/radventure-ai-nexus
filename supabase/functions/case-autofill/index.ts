
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { 
  buildPromptBasicComplete,
  buildPromptStructuredComplete, 
  buildPromptQuizComplete,
  buildPromptExplanationComplete,
  buildPromptFindings,
  buildPromptClinicalInfo,
  buildPromptHint
} from './prompts.ts';

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
  category_id?: string;
  difficulty_level?: string;
  differential_diagnoses?: string[];
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

// Nova função para configurações avançadas inteligentes
function buildPromptAdvancedConfig({ diagnosis, difficulty_level, modality, contextData }: { diagnosis: string, difficulty_level?: string, modality?: string, contextData?: any }) {
  return [
    {
      role: "system",
      content: `Você é um especialista em gamificação e configuração de casos médicos educacionais.

Com base no diagnóstico, dificuldade e modalidade fornecidos, configure de forma inteligente as configurações avançadas de gamificação.

REGRAS DE CONFIGURAÇÃO INTELIGENTE:
- can_skip: true para casos básicos, false para casos complexos
- max_elimination: 0-2 baseado na dificuldade (1=0, 2=1, 3=2, 4=2)
- ai_hint_enabled: true para casos de dificuldade 3-4, false para 1-2
- skip_penalty_points: 1-3 pontos baseado na dificuldade
- elimination_penalty_points: 1-2 pontos baseado na dificuldade
- ai_tutor_level: "basico" para dificuldade 1-2, "detalhado" para 3-4
- achievement_triggers: baseado no diagnóstico e complexidade

Retorne EXATAMENTE este JSON:
{
  "can_skip": boolean,
  "max_elimination": number,
  "ai_hint_enabled": boolean,
  "skip_penalty_points": number,
  "elimination_penalty_points": number,
  "ai_tutor_level": "basico|detalhado",
  "achievement_triggers": {}
}`
    },
    {
      role: "user",
      content: `Diagnóstico: ${diagnosis}
Dificuldade: ${difficulty_level || 'não especificado'}
Modalidade: ${modality || 'não especificado'}`
    }
  ];
}

// Nova função para preenchimento completo master
function buildPromptMasterComplete({ diagnosis, contextData }: { diagnosis: string, contextData?: any }) {
  return [
    {
      role: "system",
      content: `Você é um especialista em radiologia que cria casos médicos completos e estruturados.

Com base no diagnóstico fornecido, preencha TODOS os campos possíveis para criar um caso médico educacional completo.

IMPORTANTE: Este é um preenchimento MASTER que deve incluir:
1. Dados básicos (categoria, dificuldade, modalidade, demografia)
2. Achados radiológicos neutros (sem revelar diagnóstico)
3. Resumo clínico neutro
4. Dados estruturados completos com EXATAMENTE 4 diagnósticos diferenciais
5. Quiz completo baseado nos diagnósticos
6. Explicação educacional detalhada
7. Configurações avançadas inteligentes

REGRA CRÍTICA: NUNCA revele o diagnóstico nos campos "findings", "patient_clinical_info", "main_question" ou alternativas.

Retorne EXATAMENTE este JSON estruturado:
{
  "category_id": number,
  "difficulty_level": number,
  "points": number,
  "modality": "string",
  "subtype": "string",
  "patient_age": "string",
  "patient_gender": "string",
  "symptoms_duration": "string",
  "findings": "string - achados neutros",
  "patient_clinical_info": "string - resumo neutro",
  "primary_diagnosis": "string",
  "differential_diagnoses": ["diff1", "diff2", "diff3", "diff4"],
  "anatomical_regions": ["string1", "string2"],
  "main_symptoms": ["string1", "string2"],
  "learning_objectives": ["obj1", "obj2", "obj3"],
  "main_question": "string - pergunta neutra",
  "answer_options": ["diagnóstico_correto", "diff1", "diff2", "diff3"],
  "correct_answer_index": 0,
  "answer_feedbacks": ["feedback_correto", "feedback_diff1", "feedback_diff2", "feedback_diff3"],
  "answer_short_tips": ["dica1", "dica2", "dica3", "dica4"],
  "explanation": "string - explicação educacional completa",
  "manual_hint": "string - dica concisa",
  "can_skip": boolean,
  "max_elimination": number,
  "ai_hint_enabled": boolean,
  "skip_penalty_points": number,
  "elimination_penalty_points": number,
  "ai_tutor_level": "basico|detalhado"
}`
    },
    {
      role: "user",
      content: `Diagnóstico: ${diagnosis}`
    }
  ];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseData, action = 'smart_autofill', templateType = 'generic' } = await req.json();
    console.log('🚀 Received case autofill request:', { action, templateType });

    // Validação obrigatória: diagnóstico principal para actions específicas
    const requiresDiagnosis = [
      'autofill_basic_complete', 
      'autofill_structured_complete', 
      'autofill_quiz_complete', 
      'autofill_explanation_complete',
      'autofill_advanced_config',
      'autofill_master_complete'
    ];
    
    if (requiresDiagnosis.includes(action) && !caseData?.primary_diagnosis?.trim()) {
      return new Response(
        JSON.stringify({ 
          error: 'Diagnóstico principal é obrigatório para usar a AI nesta seção',
          field_required: 'primary_diagnosis'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const dbData = await loadDatabaseData();

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = [];

    switch (action) {
      case 'autofill_basic_complete':
        prompt = buildPromptBasicComplete({ 
          diagnosis: caseData.primary_diagnosis, 
          contextData: caseData 
        });
        break;
      case 'autofill_structured_complete':
        prompt = buildPromptStructuredComplete({ 
          diagnosis: caseData.primary_diagnosis, 
          contextData: caseData 
        });
        break;
      case 'autofill_quiz_complete':
        prompt = buildPromptQuizComplete({ 
          diagnosis: caseData.primary_diagnosis,
          differential_diagnoses: caseData.differential_diagnoses,
          contextData: caseData 
        });
        break;
      case 'autofill_explanation_complete':
        prompt = buildPromptExplanationComplete({ 
          diagnosis: caseData.primary_diagnosis,
          findings: caseData.findings,
          contextData: caseData 
        });
        break;
      case 'autofill_advanced_config':
        prompt = buildPromptAdvancedConfig({
          diagnosis: caseData.primary_diagnosis,
          difficulty_level: caseData.difficulty_level,
          modality: caseData.modality,
          contextData: caseData
        });
        break;
      case 'autofill_master_complete':
        prompt = buildPromptMasterComplete({ 
          diagnosis: caseData.primary_diagnosis,
          contextData: caseData 
        });
        break;
      case 'generate_findings':
        prompt = buildPromptFindings({ 
          diagnosis: caseData.primary_diagnosis,
          modality: caseData.modality,
          subtype: caseData.subtype,
          systemPrompt: null
        });
        break;
      case 'generate_clinical_info':
        prompt = buildPromptClinicalInfo({ 
          diagnosis: caseData.primary_diagnosis,
          modality: caseData.modality,
          subtype: caseData.subtype,
          systemPrompt: null
        });
        break;
      case 'generate_hint':
        prompt = buildPromptHint({ 
          diagnosis: caseData.primary_diagnosis,
          findings: caseData.findings,
          modality: caseData.modality,
          subtype: caseData.subtype,
          systemPrompt: null
        });
        break;
      default:
        prompt = [
          {
            role: "system",
            content: "Você é um radiologista especialista que auxilia na criação de casos médicos estruturados e educacionais. Retorne sempre um JSON válido e bem estruturado."
          },
          {
            role: "user",
            content: `Analise este caso: ${JSON.stringify(caseData)}`
          }
        ];
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
        messages: prompt,
        response_format: { type: 'json_object' },
        max_tokens: 3000,
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
