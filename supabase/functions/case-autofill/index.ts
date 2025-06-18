
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
  category_id?: string;
  difficulty_level?: string;
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

// Prompts especializados para cada action
const AI_PROMPTS = {
  autofill_structured_data: `
Analise o diagnóstico e contexto médico para gerar dados estruturados completos.

CASO: {caseData}
DADOS DO BANCO: {dbData}

GERE DADOS ESTRUTURADOS EM JSON:
{
  "primary_diagnosis": "Diagnóstico principal específico",
  "secondary_diagnoses": ["Diagnóstico diferencial 1", "Diagnóstico diferencial 2"],
  "case_classification": "diagnostico|diferencial|emergencial|didatico",
  "cid10_code": "Código CID-10 apropriado",
  "anatomical_regions": ["Região anatômica específica"],
  "finding_types": ["Tipo de achado radiológico"],
  "laterality": "bilateral|direito|esquerdo|central",
  "pathology_types": ["Tipo de patologia"],
  "differential_diagnoses": ["Hipótese diagnóstica 1", "Hipótese 2"]
}`,

  autofill_clinical_summary: `
Gere um resumo clínico estruturado baseado no diagnóstico e contexto.

CASO: {caseData}

GERE RESUMO CLÍNICO EM JSON:
{
  "main_symptoms": ["Sintoma principal", "Sintoma secundário"],
  "vital_signs": {
    "temperature": "valor",
    "blood_pressure": "valor",
    "heart_rate": "valor"
  },
  "medical_history": ["Histórico relevante 1", "Histórico 2"],
  "symptoms_duration": "Duração estimada dos sintomas",
  "patient_age": "Idade típica para o caso",
  "patient_gender": "Gênero mais comum para o caso"
}`,

  autofill_educational_tags: `
Gere tags educacionais e metadados baseados no diagnóstico.

CASO: {caseData}

GERE TAGS EDUCACIONAIS EM JSON:
{
  "learning_objectives": ["Objetivo educacional 1", "Objetivo 2"],
  "clinical_presentation_tags": ["Tag clínica 1", "Tag 2"],
  "case_complexity_factors": ["Fator de complexidade"],
  "search_keywords": ["palavra-chave1", "palavra-chave2"],
  "target_audience": ["Graduação", "Residência R1"],
  "medical_subspecialty": ["Subespecialidade médica"],
  "structured_metadata": {
    "key_learning_points": ["Ponto chave 1", "Ponto 2"],
    "common_mistakes": ["Erro comum 1", "Erro 2"]
  }
}`,

  autofill_gamification: `
Gere métricas de gamificação baseadas na complexidade do caso.

CASO: {caseData}

GERE GAMIFICAÇÃO EM JSON:
{
  "case_rarity": "comum|raro|muito_raro",
  "educational_value": 8,
  "clinical_relevance": 9,
  "estimated_solve_time": 7,
  "prerequisite_cases": ["Caso básico relacionado"],
  "unlocks_cases": ["Caso avançado que este caso libera"],
  "achievement_triggers": {
    "first_diagnosis": "Primeiro diagnóstico correto",
    "speed_bonus": "Diagnóstico rápido"
  },
  "exam_context": "rotina|urgencia|uti|ambulatorio",
  "similar_cases_ids": ["ID de caso similar"]
}`,

  autofill_quiz_complete: `
Gere pergunta principal, alternativas, feedbacks e dicas curtas.

CASO: {caseData}

GERE QUIZ COMPLETO EM JSON:
{
  "main_question": "Pergunta clara e específica sobre o diagnóstico",
  "answer_options": [
    "Opção correta baseada no diagnóstico",
    "Distrator plausível 1",
    "Distrator plausível 2",
    "Distrator plausível 3"
  ],
  "correct_answer_index": 0,
  "answer_feedbacks": [
    "Feedback detalhado para opção correta explicando por que está certa",
    "Explicação sobre por que o distrator 1 está incorreto",
    "Explicação sobre por que o distrator 2 está incorreto",
    "Explicação sobre por que o distrator 3 está incorreto"
  ],
  "answer_short_tips": [
    "Dica resumida para opção correta",
    "Dica sobre o erro no distrator 1",
    "Dica sobre o erro no distrator 2",
    "Dica sobre o erro no distrator 3"
  ]
}`,

  autofill_explanation_feedback: `
Gere explicação detalhada e dica manual para o caso.

CASO: {caseData}

GERE EXPLICAÇÃO E FEEDBACK EM JSON:
{
  "explanation": "Explicação detalhada sobre o diagnóstico, achados radiológicos, fisiopatologia e relevância clínica. Inclua raciocínio diagnóstico step-by-step.",
  "manual_hint": "Dica estratégica para orientar o raciocínio sem dar a resposta diretamente"
}`,

  autofill_advanced_config: `
Configure as opções avançadas baseadas no tipo de caso.

CASO: {caseData}

GERE CONFIGURAÇÕES AVANÇADAS EM JSON:
{
  "can_skip": true,
  "max_elimination": 2,
  "ai_hint_enabled": true,
  "skip_penalty_points": 2,
  "elimination_penalty_points": 1,
  "ai_tutor_level": "intermediario",
  "points": 15
}`,

  master_autofill: `
Analise completamente o caso e preencha TODOS os campos do formulário.

CASO: {caseData}
DADOS DO BANCO: {dbData}

PREENCHA TUDO EM JSON:
{
  "basic_data": {
    "category_id": "ID_da_especialidade",
    "difficulty_level": "nivel_1_a_4",
    "points": "pontos_baseados_dificuldade",
    "modality": "modalidade_exata",
    "subtype": "subtipo_exato"
  },
  "structured_data": {
    "primary_diagnosis": "Diagnóstico principal",
    "secondary_diagnoses": ["Diagnóstico diferencial"],
    "case_classification": "tipo_do_caso",
    "cid10_code": "codigo_cid10",
    "anatomical_regions": ["regiao_anatomica"],
    "finding_types": ["tipo_achado"],
    "laterality": "lateralidade",
    "pathology_types": ["tipo_patologia"],
    "differential_diagnoses": ["diagnosticos_diferenciais"]
  },
  "clinical_summary": {
    "main_symptoms": ["sintomas_principais"],
    "vital_signs": {"temperatura": "valor"},
    "medical_history": ["historico_medico"],
    "symptoms_duration": "duracao_sintomas",
    "patient_age": "idade_paciente",
    "patient_gender": "genero_paciente"
  },
  "educational_tags": {
    "learning_objectives": ["objetivos_aprendizado"],
    "clinical_presentation_tags": ["tags_clinicas"],
    "case_complexity_factors": ["fatores_complexidade"],
    "search_keywords": ["palavras_chave"],
    "target_audience": ["publico_alvo"],
    "medical_subspecialty": ["subespecialidade"],
    "structured_metadata": {"pontos_chave": ["pontos"]}
  },
  "gamification": {
    "case_rarity": "raridade",
    "educational_value": 8,
    "clinical_relevance": 9,
    "estimated_solve_time": 7,
    "exam_context": "contexto_exame"
  },
  "quiz": {
    "main_question": "pergunta_principal",
    "answer_options": ["opcao1", "opcao2", "opcao3", "opcao4"],
    "correct_answer_index": 0,
    "answer_feedbacks": ["feedback1", "feedback2", "feedback3", "feedback4"],
    "answer_short_tips": ["dica1", "dica2", "dica3", "dica4"]
  },
  "explanation": {
    "explanation": "explicacao_detalhada",
    "manual_hint": "dica_manual"
  },
  "advanced_config": {
    "can_skip": true,
    "max_elimination": 2,
    "ai_hint_enabled": true,
    "skip_penalty_points": 2,
    "elimination_penalty_points": 1,
    "ai_tutor_level": "intermediario",
    "points": 15
  }
}`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseData, action = 'smart_autofill' } = await req.json();
    console.log('🚀 Received case autofill request:', { action });

    // Carregar dados do banco
    const dbData = await loadDatabaseData();

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = '';
    
    // Selecionar prompt baseado na action
    switch (action) {
      case 'autofill_structured_data':
        prompt = buildPrompt(AI_PROMPTS.autofill_structured_data, caseData, dbData);
        break;
      case 'autofill_clinical_summary':
        prompt = buildPrompt(AI_PROMPTS.autofill_clinical_summary, caseData, dbData);
        break;
      case 'autofill_educational_tags':
        prompt = buildPrompt(AI_PROMPTS.autofill_educational_tags, caseData, dbData);
        break;
      case 'autofill_gamification':
        prompt = buildPrompt(AI_PROMPTS.autofill_gamification, caseData, dbData);
        break;
      case 'autofill_quiz_complete':
        prompt = buildPrompt(AI_PROMPTS.autofill_quiz_complete, caseData, dbData);
        break;
      case 'autofill_explanation_feedback':
        prompt = buildPrompt(AI_PROMPTS.autofill_explanation_feedback, caseData, dbData);
        break;
      case 'autofill_advanced_config':
        prompt = buildPrompt(AI_PROMPTS.autofill_advanced_config, caseData, dbData);
        break;
      case 'master_autofill':
        prompt = buildPrompt(AI_PROMPTS.master_autofill, caseData, dbData);
        break;
      default:
        // Fallback para actions existentes
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

function buildPrompt(template: string, caseData: CaseData, dbData: any): string {
  return template
    .replace('{caseData}', JSON.stringify(caseData, null, 2))
    .replace('{dbData}', JSON.stringify(dbData, null, 2));
}

function buildSmartAutofillPrompt(caseData: CaseData, dbData: any): string {
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
    "category_id": "ID_NUMERICO",
    "difficulty_level": "NUMERO_1_A_4",
    "modality": "NOME_EXATO_MODALIDADE",
    "subtype": "NOME_EXATO_SUBTIPO"
  }
}
`;

  return SMART_AUTOFILL_PROMPT
    .replace('{specialties}', JSON.stringify(dbData.specialties))
    .replace('{modalities}', JSON.stringify(dbData.modalities))
    .replace('{subtypes}', JSON.stringify(dbData.subtypes))
    .replace('{caseData}', JSON.stringify(caseData, null, 2));
}
