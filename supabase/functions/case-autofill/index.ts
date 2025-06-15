import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  buildPromptAlternatives,
  buildPromptFindings,
  buildPromptClinicalInfo,
  buildPromptHint,
  buildPromptFullCase,
} from "./prompts.ts";
import { tryParseJsonFromCompletion, trimFieldsOnPayload } from "./utils.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXAMPLES = `
Exemplo de answer_feedbacks:
[
  "Excelente! Você correlacionou o achado radiológico ao quadro clínico.",
  "Boa tentativa! Analise novamente os sintomas principais apresentados.",
  "Quase lá! Compare detidamente a alteração radiológica.",
  "Siga estudando! Veja o contexto clínico para descartar esta opção."
]
Exemplo de explanation:
"Achado X na radiografia, aliado ao sintoma Y, justifica o diagnóstico. O diferencial Z é excluído pela ausência de Q."
`;

// Regras reutilizáveis por todos os prompts
const DIAG_NOT_REVEALED = "REGRAS IMPORTANTES: NUNCA integre, cite, sugira ou deduza o diagnóstico principal nos campos do caso clínico, inclusive achados, resumo clínico, pergunta principal, alternativas etc. Os campos devem fornecer apenas contexto, sem nunca revelar, sugerir ou favorecer o diagnóstico correto. Redija como em um caso real, SEM ENTREGAR a resposta.";
const FEEDBACK_INSTRUCTION = `
Em cada campo de "answer_feedbacks", além do tom MOTIVACIONAL, faça também:
- uma breve descrição do achado referente àquela alternativa
- e uma CORRELAÇÃO desse achado com o achado radiológico principal do caso.
Ou seja: não seja genérico – faça o estudante entender por que a alternativa está certa ou errada relacionando clinicamente e radiologicamente.
`;

// Função centralizada para enviar prompt ao OpenAI
async function getOpenAISuggestion({ messages, max_tokens = 300, temperature = 0.7 }) {
  const completionRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openAIApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens,
      temperature
    }),
  });
  const data = await completionRes.json();
  if (!completionRes.ok) {
    const text = JSON.stringify(data);
    throw new Error(text || "Failed calling OpenAI");
  }
  return data.choices?.[0]?.message?.content ?? "{}";
}

// Servidor principal
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagnosis, findings, modality, subtype, withAlternativesOnly, withHintOnly, systemPrompt, withFindingsOnly, withClinicalInfoOnly, reviewDiagnosisOnly } = await req.json();

    // ------------- NOVO: revisa diagnóstico apenas ---------------
    if (reviewDiagnosisOnly) {
      try {
        // Prompt curto e direto para revisão textual sem mudar significado
        const messages = [
          {
            role: "system",
            content:
              "Você é um corretor gramatical médico. Corrija erros de português, acentuação, deixei cada palavra começando com letra maiúscula quando apropriado, e SEMPRE mantenha o diagnóstico exato, sem alterar ou deduzir novos termos nem mudar o significado."
          },
          {
            role: "user",
            content: String(diagnosis ?? "")
          }
        ];
        const raw = await getOpenAISuggestion({ messages, max_tokens: 60, temperature: 0 });
        const diagnosis_reviewed = (raw ?? "").trim();
        return new Response(JSON.stringify({ suggestion: { diagnosis_reviewed } }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e: any) {
        return new Response(
          JSON.stringify({ error: "Failed to review diagnosis", details: e.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Alternativas (diagnósticos diferenciais + feedbacks)
    if (withAlternativesOnly) {
      try {
        const messages = buildPromptAlternatives({ diagnosis, findings, modality, subtype });
        const raw = await getOpenAISuggestion({ messages, max_tokens: 300, temperature: 0.7 });

        console.log("[Alternativas] RAW response da IA:", raw);

        let payload;
        try {
          payload = tryParseJsonFromCompletion(raw);
        } catch (parseErr: any) {
          // Falha no parse do JSON vindo da IA - retorna erro + remontagem bruta
          console.error("[Alternativas] Erro de parse JSON da IA:", parseErr.message, "\nRAW:", raw);
          return new Response(
            JSON.stringify({
              error: "API did not return a valid JSON for diffs",
              raw: raw.slice(0, 1000),
              message: parseErr.message
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Trimming/ajustes
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
      } catch (e: any) {
        // Adiciona detalhamento do erro (mensagem e até 300car da resposta bruta)
        console.error("[Alternativas] Falha inesperada:", e.message);
        return new Response(
          JSON.stringify({ error: "API did not return a valid JSON for diffs", fullError: e.message, raw: typeof e?.raw === "string" ? e.raw.slice(0, 300) : "" }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Achados radiológicos
    if (withFindingsOnly) {
      try {
        const messages = buildPromptFindings({ diagnosis, modality, subtype, systemPrompt });
        const raw = await getOpenAISuggestion({ messages, max_tokens: 100, temperature: 0.5 });
        let findings = (raw ?? "").replace(/^Achados:?\s*/i, "").slice(0, 200);
        return new Response(JSON.stringify({ suggestion: { findings } }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e: any) {
        return new Response(
          JSON.stringify({ error: "Failed calling OpenAI for findings", details: e.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Resumo clínico
    if (withClinicalInfoOnly) {
      try {
        const messages = buildPromptClinicalInfo({ diagnosis, modality, subtype, systemPrompt });
        const raw = await getOpenAISuggestion({ messages, max_tokens: 160, temperature: 0.5 });
        let patient_clinical_info = (raw ?? "").replace(/^Resumo:?\s*/i, "").slice(0, 300);

        return new Response(JSON.stringify({ suggestion: { patient_clinical_info } }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e: any) {
        return new Response(
          JSON.stringify({ error: "Failed calling OpenAI for clinical info", details: e.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Dica (hint)
    if (withHintOnly) {
      try {
        const messages = buildPromptHint({ diagnosis, findings, modality, subtype, systemPrompt });
        const raw = await getOpenAISuggestion({ messages, max_tokens: 120, temperature: 0.6 });
        let hint = (raw ?? "").replace(/^Dica:?\s*/i, "").slice(0, 200);

        return new Response(JSON.stringify({ suggestion: { hint } }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e: any) {
        return new Response(
          JSON.stringify({ error: "Failed calling OpenAI for hint", details: e.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Preenchimento completo -- aqui usamos o prompt refatorado!
    {
      try {
        const messages = buildPromptFullCase({ diagnosis, findings, modality, subtype });
        const raw = await getOpenAISuggestion({ messages, max_tokens: 700, temperature: 0.7 });
        const payload = tryParseJsonFromCompletion(raw);
        trimFieldsOnPayload(payload);

        // LOG: Registrar o prompt enviado e resposta da IA para facilitar debug
        console.log("PROMPT:\n", messages[0].content);
        console.log("USER CONTENT:", messages[1].content);
        console.log("RAW RESPONSE:", raw);

        return new Response(JSON.stringify({ suggestion: payload }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e: any) {
        return new Response(
          JSON.stringify({ error: "API did not return a valid JSON", raw: e.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || err?.toString() }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// ... fim do arquivo
