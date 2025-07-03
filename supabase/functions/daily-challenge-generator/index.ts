import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DailyChallengeData {
  id: string;
  question: string;
  correct_answer: boolean;
  explanation: string;
}

// Banco de perguntas de fallback para radiologia
const FALLBACK_CHALLENGES: DailyChallengeData[] = [
  {
    id: "fallback-1",
    question: "A tomografia computadorizada é mais sensível que a radiografia simples para detectar fraturas de costelas?",
    correct_answer: true,
    explanation: "Verdadeiro. A TC é significativamente mais sensível para detectar fraturas de costelas, especialmente as não-deslocadas, devido à sua capacidade de fornecer imagens em cortes finos e reconstruções multiplanares."
  },
  {
    id: "fallback-2", 
    question: "O contraste iodado pode ser usado com segurança em pacientes com alergia ao iodo alimentar?",
    correct_answer: true,
    explanation: "Verdadeiro. A alergia ao iodo alimentar (frutos do mar) não contraindica o uso de contraste iodado, pois são mecanismos alérgicos diferentes. A reação ao contraste está relacionada à osmolaridade e não ao iodo propriamente dito."
  },
  {
    id: "fallback-3",
    question: "A ressonância magnética sempre requer contraste para avaliar lesões hepáticas?",
    correct_answer: false,
    explanation: "Falso. Muitas lesões hepáticas podem ser caracterizadas adequadamente com sequências de RM sem contraste, incluindo T1, T2, difusão e sequências específicas como in-phase e out-of-phase."
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🌅 Iniciando geração de desafio diário...');

    // Verificar se já existe desafio para hoje
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingChallenge } = await supabaseClient
      .from('daily_challenges')
      .select('*')
      .eq('challenge_date', today)
      .eq('is_active', true)
      .single();

    if (existingChallenge) {
      console.log('✅ Desafio já existe para hoje:', existingChallenge.id);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Desafio já existe para hoje',
        challenge_id: existingChallenge.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let challengeData: DailyChallengeData;

    // Tentar buscar de API externa (por enquanto usamos fallback)
    try {
      // TODO: Implementar chamada para API externa quando disponível
      // const externalResponse = await fetch('API_EXTERNA_URL');
      // challengeData = await externalResponse.json();
      
      // Por enquanto, usar fallback rotativo
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const challengeIndex = dayOfYear % FALLBACK_CHALLENGES.length;
      challengeData = {
        ...FALLBACK_CHALLENGES[challengeIndex],
        id: `${FALLBACK_CHALLENGES[challengeIndex].id}-${today}`
      };
      
      console.log('📝 Usando pergunta de fallback:', challengeData.id);
    } catch (error) {
      console.error('⚠️ Erro ao buscar da API externa, usando fallback:', error);
      
      // Usar último desafio como fallback em caso de erro
      const { data: lastChallenge } = await supabaseClient
        .from('daily_challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastChallenge) {
        challengeData = {
          id: `retry-${lastChallenge.external_id}-${today}`,
          question: lastChallenge.question,
          correct_answer: lastChallenge.correct_answer,
          explanation: lastChallenge.explanation
        };
        console.log('🔄 Reutilizando último desafio válido');
      } else {
        // Fallback final
        challengeData = {
          ...FALLBACK_CHALLENGES[0],
          id: `emergency-fallback-${today}`
        };
        console.log('🚨 Usando fallback de emergência');
      }
    }

    // Sanitizar conteúdo
    const sanitizedQuestion = challengeData.question.replace(/<[^>]*>/g, '').trim();
    const sanitizedExplanation = challengeData.explanation.replace(/<[^>]*>/g, '').trim();

    // Inserir desafio no banco
    const { data: newChallenge, error: insertError } = await supabaseClient
      .from('daily_challenges')
      .insert({
        external_id: challengeData.id,
        question: sanitizedQuestion,
        correct_answer: challengeData.correct_answer,
        explanation: sanitizedExplanation,
        challenge_date: today,
        community_stats: { total_responses: 0, correct_responses: 0 }
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('✅ Novo desafio criado:', newChallenge.id);

    // Criar notificação para todos os usuários ativos
    const { data: activeUsers } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('type', 'USER');

    if (activeUsers && activeUsers.length > 0) {
      const notifications = activeUsers.map(user => ({
        user_id: user.id,
        type: 'daily_challenge',
        title: '🎯 Desafio do Dia Disponível!',
        message: 'Um novo desafio diário está esperando por você. Responda e ganhe 5 RadCoins!',
        priority: 'medium',
        action_url: '/app/dashboard',
        action_label: 'Responder Agora',
        metadata: {
          challenge_id: newChallenge.id,
          challenge_date: today
        }
      }));

      // Inserir notificações em lotes para performance
      const batchSize = 100;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        await supabaseClient.from('notifications').insert(batch);
      }

      console.log(`📢 ${notifications.length} notificações enviadas`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Desafio diário gerado com sucesso',
      challenge_id: newChallenge.id,
      notifications_sent: activeUsers?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na geração do desafio diário:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});