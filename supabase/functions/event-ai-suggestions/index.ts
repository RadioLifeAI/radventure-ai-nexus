
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, filters, context } = await req.json();
    
    // Buscar dados REAIS do banco para contexto
    const { data: specialties } = await supabase
      .from('medical_specialties')
      .select('name')
      .order('name');
    
    const { data: modalities } = await supabase
      .from('imaging_modalities')
      .select('name')
      .order('name');

    const { data: subtypes } = await supabase
      .from('imaging_subtypes')
      .select('name, modality_name')
      .order('name');

    const { data: recentEvents } = await supabase
      .from('events')
      .select('name, description, case_filters')
      .order('created_at', { ascending: false })
      .limit(5);

    // Organizar subtipos por modalidade
    const subtypesByModality: Record<string, string[]> = {};
    subtypes?.forEach(subtype => {
      if (!subtypesByModality[subtype.modality_name]) {
        subtypesByModality[subtype.modality_name] = [];
      }
      subtypesByModality[subtype.modality_name].push(subtype.name);
    });

    let prompt = '';
    
    if (type === 'suggest') {
      prompt = `
Como especialista em radiologia médica e gamificação educacional, sugira 3 ideias de eventos para um quiz gamificado de radiologia.

Contexto do sistema (DADOS REAIS):
- Especialidades disponíveis: ${specialties?.map(s => s.name).join(', ')}
- Modalidades de imagem: ${modalities?.map(m => m.name).join(', ')}
- Subtipos por modalidade: ${JSON.stringify(subtypesByModality, null, 2)}
- Eventos recentes: ${recentEvents?.map(e => e.name).join(', ')}

${filters ? `Filtros preferidos: ${JSON.stringify(filters)}` : ''}
${context ? `Contexto adicional: ${context}` : ''}

Para cada sugestão, forneça:
1. Nome do evento (criativo e profissional)
2. Descrição breve (2-3 linhas)
3. Especialidade foco (uma das disponíveis)
4. Modalidade recomendada (uma das 9 principais)
5. Subtipo específico (baseado na modalidade escolhida)
6. Número sugerido de casos (5-15)
7. Duração em minutos (15-45)
8. Público-alvo (estudantes/residentes/especialistas)
9. Premiação em RadCoins proporcional à dificuldade

IMPORTANTE: Use apenas especialidades, modalidades e subtipos que existem no sistema.

Responda em formato JSON:
{
  "suggestions": [
    {
      "name": "...",
      "description": "...",
      "specialty": "...",
      "modality": "...",
      "subtype": "...",
      "numberOfCases": 10,
      "durationMinutes": 30,
      "target": "...",
      "prizeRadcoins": 500
    }
  ]
}`;
    } else if (type === 'autofill') {
      prompt = `
Com base nos filtros e contexto fornecidos, preencha automaticamente um formulário de evento de radiologia.

DADOS REAIS DO SISTEMA:
- Especialidades: ${specialties?.map(s => s.name).join(', ')}
- Modalidades: ${modalities?.map(m => m.name).join(', ')}
- Subtipos disponíveis: ${JSON.stringify(subtypesByModality, null, 2)}

Filtros recebidos: ${JSON.stringify(filters)}
Contexto: ${context || 'Evento educacional de radiologia'}

Gere um evento completo com:
- Nome criativo e profissional
- Descrição detalhada (3-4 linhas)
- Configurações otimizadas baseadas nos filtros
- Premiação adequada ao nível de dificuldade
- case_filters com specialty, modality, subtype e difficulty válidos

IMPORTANTE: 
- Use apenas dados que existem no sistema
- O campo difficulty deve ser 1, 2, 3 ou 4
- Preencha datas inteligentes (scheduled_start/end)
- Configure prize_distribution detalhada (1º ao 10º lugar)

Responda em formato JSON compatível com o formulário:
{
  "name": "...",
  "description": "...",
  "scheduled_start": "2024-01-15T10:00:00",
  "scheduled_end": "2024-01-15T11:00:00",
  "numberOfCases": 10,
  "durationMinutes": 30,
  "prizeRadcoins": 500,
  "autoStart": true,
  "prize_distribution": [
    {"position": 1, "prize": 200},
    {"position": 2, "prize": 150},
    {"position": 3, "prize": 100},
    {"position": 4, "prize": 75},
    {"position": 5, "prize": 50},
    {"position": 6, "prize": 30},
    {"position": 7, "prize": 25},
    {"position": 8, "prize": 20},
    {"position": 9, "prize": 15},
    {"position": 10, "prize": 10}
  ],
  "caseFilters": {
    "specialty": ["..."],
    "modality": ["..."],
    "subtype": ["..."],
    "difficulty": [1, 2]
  }
}`;
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
            content: 'Você é um especialista em radiologia médica e design de experiências educacionais gamificadas. Sempre responda em JSON válido e use apenas dados reais fornecidos do sistema.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Invalid JSON response' };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in event-ai-suggestions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
