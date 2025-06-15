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

    // Contexto reforçado: persona para IA
    let contextIntro = `Você é um especialista em radiologia e diagnóstico por imagem, focado em criar casos clínico-radiológicos concisos para quizzes de ensino. Suas explicações e feedbacks devem ser diretos, breves e sempre relacionar os achados de imagem com o quadro clínico apresentado. Sempre que sugerir a especialidade médica (categoria), utilize exatamente um dos seguintes nomes (entre aspas): "Neurorradiologia", "Coluna", "Cabeça e Pescoço", "Tórax", "Abdome", "Musculoesquelético", "Intervencionista", "Medicina de Emergência", "Pediatria", "Trauma", "Saúde da Mulher", "Obstetrícia", "Ginecologia", "Hematologia", "Gastrointestinal", "Hepatobiliar", "Dermatologia", "Otorrinolaringologia", "Oncologia", "Urologia", "Vascular", "Cirurgia", "Clínica Médica", "Reumatologia", "Nefrologia", "Cardiologia", "Neurologia", "Endocrinologia", "Infectologia", "Psiquiatria", "Outros".\n`;
    contextIntro += `O diagnóstico principal deve ser referência, sempre buscando explicação curta e voltada à integração dos achados de imagem e sintomas.`;
    if (findings || modality || subtype) {
      contextIntro += ` Informações adicionais já conhecidas: `;
      if (modality) contextIntro += `Modalidade: ${modality}. `;
      if (subtype) contextIntro += `Subtipo: ${subtype}. `;
      if (findings) contextIntro += `Achados radiológicos: ${findings}. `;
    }

    const systemPrompt = `
${contextIntro}
Com base no diagnóstico de referência abaixo, gere todos os campos do formulário do caso clínico para quiz, sempre sendo breve e prático nas explicações, e focando na integração dos achados de imagem e sintomas. Ao preencher o campo "explanation" (explicação/feedback), faça resposta curta, objetiva e que mostre somente a relação núcleo “achado de imagem + quadro clínico”. Estruture a resposta somente com os campos do JSON abaixo:
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
IMPORTANTE:
+- Nunca faça textos longos no campo “explanation”. Resuma ao máximo, valorize integração e raciocínio clínico-radiológico.
+- O diagnóstico correto sempre deve ser a opção A das alternativas.
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
