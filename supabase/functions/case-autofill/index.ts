
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
    const { diagnosis, findings, modality, subtype, withAlternativesOnly } = await req.json();

    if (withAlternativesOnly) {
      // Solicita apenas alternativas usando o contexto diferencial
      const contextIntro = `Você é um especialista em radiologia e diagnóstico por imagem, focado em criar casos clínico-radiológicos objetivos para quizzes. Sugira os três principais diagnósticos diferenciais, além do diagnóstico principal fornecido, levando em conta obrigatoriamente os achados radiológicos (${findings ?? "não especificado"}) e os dados clínicos disponíveis. Siga exatamente este formato JSON:
{
  "answer_options": ["Diagnóstico Principal", "Diagnóstico Diferencial 1", "Diagnóstico Diferencial 2", "Diagnóstico Diferencial 3"],
  "answer_feedbacks": ["Feedback para o principal", "Feedback diferencial 1", "Feedback diferencial 2", "Feedback diferencial 3"],
  "answer_short_tips": ["Dica sobre o principal", "Dica diferencial 1", "Dica diferencial 2", "Dica diferencial 3"]
}
Importante: Não explique na resposta geral, use só os campos acima. A alternativa A sempre será o diagnóstico principal.`;
      const completionRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAIApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: contextIntro },
            { role: "user", content: `Diagnóstico principal: ${diagnosis ?? "-"}; Achados radiológicos: ${findings ?? "-"}; Modalidade: ${modality ?? "-"}; Subtipo: ${subtype ?? "-"}` }
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!completionRes.ok) {
        const text = await completionRes.text();
        return new Response(
          JSON.stringify({ error: "Failed calling OpenAI (diffs)", details: text }),
          { status: 500, headers: corsHeaders }
        );
      }

      const data = await completionRes.json();
      const raw = data.choices?.[0]?.message?.content ?? "{}";
      try {
        const match = raw.match(/\{[\s\S]*\}/);
        const jsonString = match ? match[0] : raw;
        const payload = JSON.parse(jsonString);

        // Trimming feedbacks and explanations to 200 chars
        if (Array.isArray(payload.answer_feedbacks)) {
          payload.answer_feedbacks = payload.answer_feedbacks.map((f: string) =>
            typeof f === "string" ? f.trim().slice(0, 200) : ""
          );
        }
        if (Array.isArray(payload.answer_short_tips)) {
          payload.answer_short_tips = payload.answer_short_tips.map((f: string) =>
            typeof f === "string" ? f.trim().slice(0, 200) : ""
          );
        }

        return new Response(JSON.stringify({ suggestion: payload }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(
          JSON.stringify({ error: "API did not return a valid JSON for diffs", raw }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // --- CONTEXTO MAIS RESUMIDO E OBJETIVO PARA EXPLICAÇÃO E TODO O AUTO-PREENCHIMENTO ---
    let contextIntro = `Você é um especialista em radiologia e diagnóstico por imagem que elabora casos clínico-radiológicos objetivamente para quizzes de ensino, valorizando sempre integração entre achados de imagem e quadro clínico.` +
      ` Nas explicações e feedbacks, responda DE FORMA EXTREMAMENTE BREVE, SEM frases genéricas, usando sempre apenas a relação entre os achados radiológicos e sintomas ou contexto clínico.`;
    contextIntro += ` Nunca faça textos longos ou divagações.`;
    if (findings || modality || subtype) {
      contextIntro += ` Dados do caso: `;
      if (modality) contextIntro += `Modalidade: ${modality}. `;
      if (subtype) contextIntro += `Subtipo: ${subtype}. `;
      if (findings) contextIntro += `Achados radiológicos: ${findings}. `;
    }

    const systemPrompt = `
${contextIntro}
Com base no DIAGNÓSTICO de referência abaixo, preencha somente o JSON com todos os campos do caso clínico, em formato o mais enxuto possível e FOQUE só na integração dos achados com o quadro clínico, especialmente em "explanation" e "feedbacks". Estruture assim:
{
  "category": "",
  "difficulty": 2,
  "points": 20,
  "modality": "",
  "subtype": "",
  "findings": "",
  "patient_clinical_info": "",
  "patient_age": "33",
  "patient_gender": "Feminino",
  "symptoms_duration": "7 dias",
  "main_question": "",
  "answer_options": ["", "", "", ""],
  "answer_feedbacks": ["", "", "", ""],
  "answer_short_tips": ["", "", "", ""],
  "explanation": ""
}
Importante:
+ Só relacione achados radiológicos e contexto clínico, nunca repita textos intro ou genéricos.
+ O campo "explanation" deve ter apenas 1-2 frases.
+ O diagnóstico correto deve ser a alternativa A, e as demais, diferenciais relevantes.
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

      // --- LIMIT explanation and feedbacks to 200 chars
      if (typeof payload.explanation === "string") {
        payload.explanation = payload.explanation.trim().slice(0, 200);
      }
      if (Array.isArray(payload.answer_feedbacks)) {
        payload.answer_feedbacks = payload.answer_feedbacks.map((f: string) =>
          typeof f === "string" ? f.trim().slice(0, 200) : ""
        );
      }
      if (Array.isArray(payload.answer_short_tips)) {
        payload.answer_short_tips = payload.answer_short_tips.map((f: string) =>
          typeof f === "string" ? f.trim().slice(0, 200) : ""
        );
      }

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

// ... fim do arquivo
