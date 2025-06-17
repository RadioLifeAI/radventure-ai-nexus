
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

// Função para gerar datas inteligentes (próximo horário útil)
function generateSmartDates(durationMinutes: number = 30) {
  const now = new Date();
  const startDate = new Date(now);
  
  // Se for fim de semana, mover para próxima segunda
  if (startDate.getDay() === 0) { // Domingo
    startDate.setDate(startDate.getDate() + 1);
  } else if (startDate.getDay() === 6) { // Sábado
    startDate.setDate(startDate.getDate() + 2);
  }
  
  // Se for muito tarde (depois das 18h), mover para próximo dia útil às 14h
  if (startDate.getHours() >= 18) {
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(14, 0, 0, 0);
  } else if (startDate.getHours() < 8) {
    // Se for muito cedo (antes das 8h), definir para 14h do mesmo dia
    startDate.setHours(14, 0, 0, 0);
  } else {
    // Horário atual + 2 horas, arredondado para próxima hora cheia
    startDate.setHours(startDate.getHours() + 2, 0, 0, 0);
  }
  
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);
  
  return {
    scheduled_start: startDate.toISOString().slice(0, 16),
    scheduled_end: endDate.toISOString().slice(0, 16)
  };
}

// Função para gerar distribuição de prêmios inteligente
function generatePrizeDistribution(totalPrize: number) {
  const distributions = [
    { position: 1, percentage: 35 },
    { position: 2, percentage: 20 },
    { position: 3, percentage: 15 },
    { position: 4, percentage: 10 },
    { position: 5, percentage: 8 },
    { position: 6, percentage: 5 },
    { position: 7, percentage: 3 },
    { position: 8, percentage: 2 },
    { position: 9, percentage: 1 },
    { position: 10, percentage: 1 }
  ];
  
  return distributions.map(({ position, percentage }) => ({
    position,
    prize: Math.round((totalPrize * percentage) / 100)
  }));
}

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

    const { data: difficulties } = await supabase
      .from('difficulties')
      .select('level, description')
      .order('level');

    const { data: recentEvents } = await supabase
      .from('events')
      .select('name, description, case_filters, number_of_cases, duration_minutes')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: caseStats } = await supabase
      .from('medical_cases')
      .select('specialty, modality, subtype, difficulty_level')
      .limit(100);

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
- Níveis de dificuldade: ${difficulties?.map(d => `${d.level} (${d.description})`).join(', ')}
- Eventos recentes: ${recentEvents?.map(e => e.name).join(', ')}
- Estatísticas de casos: ${caseStats?.length} casos disponíveis

${filters ? `Filtros preferidos: ${JSON.stringify(filters)}` : ''}
${context ? `Contexto adicional: ${context}` : ''}

Para cada sugestão, forneça:
1. Nome do evento (criativo e profissional)
2. Descrição breve (2-3 linhas)
3. Especialidade foco (uma das disponíveis)
4. Modalidade recomendada (uma das principais)
5. Subtipo específico (baseado na modalidade escolhida)
6. Número sugerido de casos (5-20)
7. Duração em minutos (15-60)
8. Nível de dificuldade (1-4)
9. Público-alvo (estudantes/residentes/especialistas)
10. Premiação em RadCoins proporcional à dificuldade

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
      "difficulty": 2,
      "target": "...",
      "prizeRadcoins": 500
    }
  ]
}`;
    } else if (type === 'autofill') {
      const smartDates = generateSmartDates(30); // Default 30 min, será ajustado pela IA
      
      prompt = `
Com base nos filtros e contexto fornecidos, preencha automaticamente um formulário COMPLETO de evento de radiologia com TODOS os campos.

DADOS REAIS DO SISTEMA:
- Especialidades: ${specialties?.map(s => s.name).join(', ')}
- Modalidades: ${modalities?.map(m => m.name).join(', ')}
- Subtipos disponíveis: ${JSON.stringify(subtypesByModality, null, 2)}
- Níveis de dificuldade: ${difficulties?.map(d => `${d.level} (${d.description})`).join(', ')}
- Casos existentes: ${caseStats?.length} casos no banco

Filtros recebidos: ${JSON.stringify(filters)}
Contexto: ${context || 'Evento educacional de radiologia gamificado'}

INSTRUÇÕES CRÍTICAS:
- Preencha TODOS os campos do formulário
- Use apenas dados que existem no sistema
- autoStart deve SEMPRE ser true
- Gere datas inteligentes (horário útil)
- Crie distribuição de prêmios detalhada (1º ao 10º lugar)
- Defina número realista de participantes
- Banner URL opcional (pode ficar vazio)

Responda em formato JSON com TODOS os campos:
{
  "name": "Nome criativo e profissional do evento",
  "description": "Descrição detalhada e motivadora (4-5 linhas)",
  "scheduled_start": "${smartDates.scheduled_start}",
  "scheduled_end": "${smartDates.scheduled_end}",
  "numberOfCases": 12,
  "durationMinutes": 35,
  "prizeRadcoins": 1000,
  "maxParticipants": 50,
  "bannerUrl": "",
  "autoStart": true,
  "prize_distribution": [
    {"position": 1, "prize": 350},
    {"position": 2, "prize": 200},
    {"position": 3, "prize": 150},
    {"position": 4, "prize": 100},
    {"position": 5, "prize": 80},
    {"position": 6, "prize": 50},
    {"position": 7, "prize": 30},
    {"position": 8, "prize": 20},
    {"position": 9, "prize": 10},
    {"position": 10, "prize": 10}
  ],
  "caseFilters": {
    "specialty": ["Especialidade específica"],
    "modality": ["Modalidade específica"],
    "subtype": ["Subtipo específico"],
    "difficulty": [1, 2]
  }
}

IMPORTANTE: Ajuste as datas baseado na duração escolhida e certifique-se de que todos os valores são realistas e coerentes.`;
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
            content: 'Você é um especialista em radiologia médica e design de experiências educacionais gamificadas. Sempre responda em JSON válido e use apenas dados reais fornecidos do sistema. Seja preciso e detalhado nos preenchimentos.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let result = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Invalid JSON response' };

    // Para autofill, ajustar datas baseado na duração retornada
    if (type === 'autofill' && result.durationMinutes) {
      const adjustedDates = generateSmartDates(result.durationMinutes);
      result.scheduled_start = adjustedDates.scheduled_start;
      result.scheduled_end = adjustedDates.scheduled_end;
      
      // Gerar distribuição de prêmios baseada no valor total
      if (result.prizeRadcoins) {
        result.prize_distribution = generatePrizeDistribution(result.prizeRadcoins);
      }
    }

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
