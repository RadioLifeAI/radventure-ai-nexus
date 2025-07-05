import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json().catch(() => ({}))
    const { action } = body

    console.log(`📅 Daily Challenge Generator - Action: ${action}`)

    // Ação: Publicar desafio diário
    if (action === 'publish_daily') {
      const { data: result, error } = await supabase.rpc('publish_next_daily_challenge')
      
      if (error) {
        console.error('Erro ao publicar desafio:', error)
        return new Response(
          JSON.stringify({ error: 'Erro ao publicar desafio', details: error.message }),
          { status: 500, headers: corsHeaders }
        )
      }

      console.log('✅ Desafio publicado:', result)
      return new Response(
        JSON.stringify({ success: true, result }),
        { headers: corsHeaders }
      )
    }

    // Ação padrão: Buscar desafios atuais
    const { data: challenges, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('challenge_date', new Date().toISOString().split('T')[0])

    if (error) {
      console.error('Erro ao buscar desafios:', error)
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { status: 500, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        challenges: challenges || [],
        count: challenges?.length || 0 
      }),
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: corsHeaders }
    )
  }
})