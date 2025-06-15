
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagnosis, findings, modality, subtype } = await req.json();

    if (!diagnosis) {
      return new Response(
        JSON.stringify({ error: "Missing diagnosis" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Novo: monta contexto dinâmico para enriquecer o prompt
    let contextIntro = `Você é um especialista em radiologia e vai ajudar a montar casos clínicos baseando-se no diagnóstico principal e possíveis informações já fornecidas pelo usuário.`;
    if (findings || modality || subtype) {
      contextIntro += ` Além do diagnóstico, considere também as informações já conhecidas para refinar as sugestões: `;
      if (modality) contextIntro += `Modalidade: ${modality}. `;
      if (subtype) contextIntro += `Subtipo: ${subtype}. `;
      if (findings) contextIntro += `Achados radiológicos: ${findings}. `;
    }

    const systemPrompt = `
${contextIntro}
Dado o diagnóstico de referência, gere sugestões detalhadas para os seguintes campos do formulário do caso clínico:
- categoria (nome da especialidade médica, ex: "Pneumologia")
- dificuldade (1 a 4)
- pontos (sugira um número, ex: 10, 20, 30, 50 proporcional à dificuldade)
- modalidade principal (ex: RX Tórax, TC Crânio etc)
- subtipo (um subtipo da modalidade, se existir)
- achados radiológicos (texto resumindo os principais achados)
- resumo clínico (texto)
- idade provável
- gênero provável (Masculino, Feminino, Outro)
- duração estimada dos sintomas
- pergunta principal (texto)
- alternativas de resposta (lista de 4 diagnósticos possíveis, o diagnóstico correto deve ser a opção A)
- para cada alternativa, forneça:
  * feedback detalhado (campo answer_feedbacks: lista de 4 feedbacks explicando cada alternativa)
  * meta-dica breve (campo answer_short_tips: lista de 4 sugestões ou dicas curtas para reflexão)
- explicação detalhada (campo explanation, orientando e fundamentando a resposta correta)
IMPORTANTE:
- Sempre preencha os campos answer_feedbacks e answer_short_tips com 4 itens, sendo cada um referente a uma alternativa.
- O diagnóstico principal deve ser a opção A nas alternativas.
- Retorne todos os dados em JSON diretamente, neste formato:
{
  "category": "...",
  "difficulty": 2,
  "points": 20,
  "modality": "...",
  "subtype": "...",
  "findings": "...",
  "patient_clinical_info": "...",
  "patient_age": "33",
  "patient_gender": "Feminino",
  "symptoms_duration": "7 dias",
  "main_question": "...",
  "answer_options": ["Diagnóstico correto", "Alternativa 1", ...],
  "answer_feedbacks": ["Feedback para A", "Feedback para B", "Feedback para C", "Feedback para D"],
  "answer_short_tips": ["Dica breve A", "Dica breve B", "Dica breve C", "Dica breve D"],
  "explanation": "..."
}
`;

    const completionRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Diagnóstico de referência: ${diagnosis}` }
        ],
        max_tokens: 700,
        temperature: 0.7,
      }),
    });

    if (!completionRes.ok) {
      const text = await completionRes.text();
      return new Response(
        JSON.stringify({ error: "Failed calling OpenAI", details: text }),
        { status: 500, headers: corsHeaders }
      );
    }

    const data = await completionRes.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    try {
      // Tenta extrair o JSON da resposta
      const match = raw.match(/\{[\s\S]*\}/);
      const jsonString = match ? match[0] : raw;
      const payload = JSON.parse(jsonString);
      return new Response(JSON.stringify({ suggestion: payload }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "API did not return a valid JSON", raw }),
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message || err?.toString() }),
      { status: 500, headers: corsHeaders }
    );
  }
});
