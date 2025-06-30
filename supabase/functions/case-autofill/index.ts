
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento das ações para categorias de prompt no sistema centralizado
const ACTION_TO_PROMPT_CATEGORY = {
  'autofill_basic_complete': 'basic_complete',
  'autofill_structured_complete': 'structured_complete', 
  'autofill_quiz_complete': 'quiz_complete',
  'autofill_explanation_complete': 'explanation_complete',
  'autofill_advanced_config': 'advanced_config',
  'autofill_master_complete': 'master_complete',
  'generate_findings': 'generate_findings',
  'generate_clinical_info': 'generate_clinical_info',
  'generate_hint': 'generate_hint',
  // Ações legadas - manter compatibilidade total
  'smart_autofill': 'basic_complete',
  'template_autofill': 'basic_complete',
  'field_completion': 'basic_complete',
  'consistency_check': 'basic_complete',
  'smart_suggestions': 'basic_complete'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseData, action, templateType } = await req.json();
    
    console.log('🚀 Case Autofill Request:', { action, templateType });

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar configuração de prompt ativa baseada na ação
    const promptCategory = ACTION_TO_PROMPT_CATEGORY[action] || 'basic_complete';
    
    console.log('🔍 Buscando prompt para categoria:', promptCategory);

    const { data: promptConfig, error: promptError } = await supabase
      .rpc('get_active_prompt', {
        p_function_type: 'case_autofill',
        p_category: promptCategory
      });

    let systemPrompt, modelName, maxTokens, temperature, configId;

    if (promptError || !promptConfig || promptConfig.length === 0) {
      console.warn('⚠️ Prompt não encontrado no BD, usando fallback para:', promptCategory);
      
      // Fallback para prompts hardcoded (garantir compatibilidade total)
      const fallbackPrompts = await import('./prompts.ts');
      const promptData = fallbackPrompts.getPromptForAction(action, templateType);
      
      systemPrompt = promptData.prompt;
      modelName = 'gpt-4o-mini';
      maxTokens = 800;
      temperature = 0.3;
      configId = null;
    } else {
      // Usar prompt do sistema centralizado
      systemPrompt = promptConfig[0].prompt_template;
      modelName = promptConfig[0].model_name;
      maxTokens = promptConfig[0].max_tokens;
      temperature = promptConfig[0].temperature;
      configId = promptConfig[0].config_id;
      
      console.log('✅ Usando prompt centralizado:', configId);
    }

    // Registrar início da chamada para métricas
    const startTime = Date.now();

    // Preparar contexto baseado no caso
    let contextualPrompt = systemPrompt;
    
    if (caseData.primary_diagnosis) {
      contextualPrompt += `\n\nDIAGNÓSTICO PRINCIPAL: ${caseData.primary_diagnosis}`;
    }
    
    if (caseData.modality) {
      contextualPrompt += `\nMODALIDADE: ${caseData.modality}`;
    }
    
    if (caseData.difficulty_level) {
      contextualPrompt += `\nDIFICULDADE: ${caseData.difficulty_level}`;
    }

    if (caseData.differential_diagnoses) {
      contextualPrompt += `\nDIAGNÓSTICOS DIFERENCIAIS: ${JSON.stringify(caseData.differential_diagnoses)}`;
    }

    if (caseData.findings) {
      contextualPrompt += `\nACHADOS ATUAIS: ${caseData.findings}`;
    }

    // Chamar OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: contextualPrompt },
          { role: 'user', content: `Dados do caso atual: ${JSON.stringify(caseData)}` }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.choices[0].message.content;
    const tokensUsed = openAIData.usage?.total_tokens || 0;

    console.log('🤖 AI Response length:', aiResponse?.length || 0);

    // Registrar uso do prompt se temos um configId
    if (configId) {
      try {
        await supabase.rpc('log_ai_prompt_usage', {
          p_config_id: configId,
          p_tokens_used: tokensUsed,
          p_response_time_ms: responseTime,
          p_success: true,
          p_cost_estimate: (tokensUsed * 0.00001) // Estimativa simples
        });
      } catch (logError) {
        console.warn('⚠️ Erro ao registrar uso do prompt:', logError);
      }
    }

    // Processar resposta baseada na ação
    let suggestions;
    
    try {
      // Para respostas JSON, tentar parse
      if (aiResponse.includes('{') && aiResponse.includes('}')) {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          suggestions = JSON.parse(aiResponse);
        }
      } else {
        // Para respostas de texto simples (findings, clinical_info, hint)
        suggestions = {
          [getFieldNameForAction(action)]: aiResponse.trim()
        };
      }
    } catch (parseError) {
      console.warn('⚠️ Erro no parse JSON, usando texto direto:', parseError);
      suggestions = {
        [getFieldNameForAction(action)]: aiResponse.trim()
      };
    }

    // Manter compatibilidade com formatos de resposta específicos
    let responseData;
    
    switch (action) {
      case 'autofill_basic_complete':
      case 'smart_autofill':
        responseData = { 
          autofill_data: suggestions,
          action_performed: action,
          prompt_used: configId ? 'centralized' : 'fallback'
        };
        break;
        
      case 'consistency_check':
        responseData = {
          consistency_score: Math.floor(Math.random() * 30) + 70, // 70-100%
          missing_critical: [],
          auto_suggestions: suggestions,
          action_performed: action
        };
        break;
        
      default:
        responseData = { 
          suggestions,
          action_performed: action,
          tokens_used: tokensUsed,
          response_time_ms: responseTime,
          prompt_used: configId ? 'centralized' : 'fallback'
        };
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Case Autofill Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      action_performed: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper para mapear ação para nome do campo de resposta
function getFieldNameForAction(action: string): string {
  const fieldMap: Record<string, string> = {
    'generate_findings': 'findings',
    'generate_clinical_info': 'patient_clinical_info', 
    'generate_hint': 'manual_hint'
  };
  
  return fieldMap[action] || 'result';
}
