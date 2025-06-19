
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, data } = await req.json();

    switch (type) {
      case 'generate_event_suggestions':
        return await generateEventSuggestions(data);
      
      case 'optimize_event':
        return await optimizeEvent(data, supabase);
      
      case 'smart_schedule':
        return await smartSchedule(data, supabase);
      
      case 'analyze_performance':
        return await analyzePerformance(data, supabase);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('AI Orchestrator error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateEventSuggestions(context: any) {
  const prompt = `
    Como especialista em eventos médicos educacionais, gere 3 sugestões de eventos baseadas no contexto:
    ${context.description || 'Eventos gerais de medicina'}
    
    Para cada evento, forneça:
    - Nome criativo e profissional
    - Descrição engajante
    - Especialidade médica
    - Modalidade de imagem
    - Número de casos (5-15)
    - Duração (15-60 minutos)
    - Prêmio em RadCoins (100-1000)
    - Público-alvo
    - Dificuldade (1-5)
    
    Responda em JSON com array de objetos.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  });

  const aiResponse = await response.json();
  const suggestions = JSON.parse(aiResponse.choices[0].message.content);

  return new Response(
    JSON.stringify({ suggestions }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function optimizeEvent(eventData: any, supabase: any) {
  // Get historical data for optimization
  const { data: historicalEvents } = await supabase
    .from('events')
    .select('*, event_registrations(count)')
    .eq('status', 'FINISHED');

  const prompt = `
    Analise este evento e forneça otimizações baseadas em dados históricos:
    
    Evento atual: ${JSON.stringify(eventData)}
    Dados históricos: ${JSON.stringify(historicalEvents?.slice(0, 10))}
    
    Forneça sugestões para:
    1. Melhor horário baseado em engagement
    2. Duração otimizada
    3. Distribuição de prêmios mais eficaz
    4. Ajustes no número de casos
    5. Melhorias na descrição
    
    Responda em JSON com score de confiança para cada sugestão.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  const aiResponse = await response.json();
  const optimizations = JSON.parse(aiResponse.choices[0].message.content);

  return new Response(
    JSON.stringify({ optimizations }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function smartSchedule(preferences: any, supabase: any) {
  // Get event data for pattern analysis
  const { data: events } = await supabase
    .from('events')
    .select('scheduled_start, event_registrations(count)')
    .not('event_registrations', 'is', null);

  const prompt = `
    Analise os padrões de participação e sugira os 5 melhores horários para o próximo evento:
    
    Preferências: ${JSON.stringify(preferences)}
    Dados históricos: ${JSON.stringify(events?.slice(0, 20))}
    
    Considere:
    - Horários com maior participação histórica
    - Dias da semana mais eficazes
    - Duração do evento
    - Público-alvo (residentes trabalham diferentes horários)
    - Fuso horário brasileiro
    
    Para cada sugestão, forneça:
    - Data e hora recomendada
    - Score de confiança (0-100)
    - Participantes esperados
    - Nível de concorrência
    - Justificativa
    
    Responda em JSON.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    }),
  });

  const aiResponse = await response.json();
  const scheduleRecommendations = JSON.parse(aiResponse.choices[0].message.content);

  return new Response(
    JSON.stringify({ scheduleRecommendations }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzePerformance(eventId: string, supabase: any) {
  // Get event performance data
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      event_registrations(count),
      event_rankings(score, rank)
    `)
    .eq('id', eventId)
    .single();

  const prompt = `
    Analise a performance deste evento e forneça insights:
    
    ${JSON.stringify(event)}
    
    Forneça análise sobre:
    1. Taxa de participação vs expectativa
    2. Engajamento dos participantes
    3. Distribuição de scores
    4. Pontos fortes e fracos
    5. Recomendações para próximos eventos
    
    Responda em JSON com métricas quantitativas e insights qualitativos.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });

  const aiResponse = await response.json();
  const analysis = JSON.parse(aiResponse.choices[0].message.content);

  return new Response(
    JSON.stringify({ analysis }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
