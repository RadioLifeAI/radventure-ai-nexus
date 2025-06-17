
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
    
    // Buscar dados relevantes do banco para contexto
    const { data: specialties } = await supabase
      .from('medical_specialties')
      .select('name');
    
    const { data: modalities } = await supabase
      .from('imaging_modalities')
      .select('name');

    const { data: recentEvents } = await supabase
      .from('events')
      .select('name, description, case_filters')
      .order('created_at', { ascending: false })
      .limit(5);

    let prompt = '';
    
    if (type === 'suggest') {
      prompt = `
Como especialista em radiologia médica e gamificação educacional, sugira 3 ideias de eventos para um quiz gamificado de radiologia.

Contexto do sistema:
- Especialidades disponíveis: ${specialties?.map(s => s.name).join(', ')}
- Modalidades de imagem: ${modalities?.map(m => m.name).join(', ')}
- Eventos recentes: ${recentEvents?.map(e => e.name).join(', ')}

${filters ? `Filtros preferidos: ${JSON.stringify(filters)}` : ''}
${context ? `Contexto adicional: ${context}` : ''}

Para cada sugestão, forneça:
1. Nome do evento (criativo e profissional)
2. Descrição breve (2-3 linhas)
3. Especialidade foco
4. Modalidade recomendada
5. Número sugerido de casos (5-15)
6. Duração em minutos (15-45)
7. Público-alvo (estudantes/residentes/especialistas)

Responda em formato JSON:
{
  "suggestions": [
    {
      "name": "...",
      "description": "...",
      "specialty": "...",
      "modality": "...",
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

Filtros: ${JSON.stringify(filters)}
Contexto: ${context || 'Evento educacional de radiologia'}

Gere um evento completo com:
- Nome criativo e profissional
- Descrição detalhada (3-4 linhas)
- Configurações otimizadas baseadas nos filtros
- Premiação adequada ao nível de dificuldade

Responda em formato JSON compatível com o formulário:
{
  "name": "...",
  "description": "...",
  "numberOfCases": 10,
  "durationMinutes": 30,
  "prizeRadcoins": 500,
  "autoStart": true,
  "caseFilters": {...}
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
            content: 'Você é um especialista em radiologia médica e design de experiências educacionais gamificadas. Sempre responda em JSON válido.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
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
