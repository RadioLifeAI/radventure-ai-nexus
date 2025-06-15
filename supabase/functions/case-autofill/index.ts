import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

// Função para buscar até N casos similares do Supabase baseado em campos básicos
async function fetchSimilarCases({ diagnosis, findings, modality }) {
  // Estratégia simples: busca casos com a mesma modalidade ou contendo parte do diagnóstico ou findings no título ou findings
  // Limita para os 3 mais recentes
  try {
    // Consulta ao Supabase REST API diretamente via fetch
    // NOTA: No contexto do Edge Function, usar fetch direto no endpoint REST
    // A autenticação pode ser feita usando o serviço role key presente no segredo de ambiente
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.log("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.");
      return [];
    }

    // Monta filtro básico em query string
    // Busca por similaridade simples (é possível sofisticar aqui no futuro)
    let queryStr = `select=title,findings,modality,answer_options,answer_feedbacks,explanation&order=created_at.desc&limit=5`;
    // Aplica filtro só se vier valor
    let filters: string[] = [];
    if (modality) filters.push(`modality=eq.${encodeURIComponent(modality)}`);
    if (diagnosis) filters.push(`title=ilike.*${encodeURIComponent(diagnosis)}*`);
    if (findings) filters.push(`findings=ilike.*${encodeURIComponent(findings)}*`);
    // Só pega casos com explanation e options válidas:
    filters.push("explanation=not.is.null");
    filters.push("answer_options=not.is.null");

    // Concatena filtros por &
    queryStr += "&" + filters.join("&");

    // Consulta REST API (usa service_role pq é backend, nunca expor para cliente!)
    const url = `${SUPABASE_URL}/rest/v1/medical_cases?${queryStr}`;

    const res = await fetch(url, {
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    const cases = await res.json();
    // Garante array:
    if (!Array.isArray(cases)) return [];
    return cases.slice(0, 3);
  } catch (err) {
    console.error("Erro ao buscar casos similares:", err);
    return [];
  }
}

// Função para gerar contexto a partir dos casos similares
function buildContextFromSimilarCases(cases = []) {
  if (!cases.length) return "";
  let msg = "Exemplos de casos reais anteriormente cadastrados no sistema:\n";
  for (const c of cases) {
    const title = c.title ?? "";
    const findings = c.findings ?? "";
    const modality = c.modality ?? "";
    const explanation = c.explanation?.slice(0, 200) ?? "";
    // Pega a alternativa correta (padrão: assume alternativa A)
    let correct = "";
    if (Array.isArray(c.answer_options) && c.answer_options.length > 0) correct = c.answer_options[0];
    msg += `- Caso: ${title}; Modalidade: ${modality}; Achados: ${findings}; Alternativa correta: ${correct}; Explicação: ${explanation}\n`;
  }
  msg += "\nUse essas referências para fundamentar seu raciocínio, mas nunca copie literalmente os textos.";
  return msg;
}

// Gera prompt para alternativas
function buildPromptAlternatives({ diagnosis, findings, modality, subtype }) {
  return [
    {
      role: "system",
      content:
        `Você é um especialista em radiologia e diagnóstico por imagem, focado em criar casos clínico-radiológicos objetivos para quizzes. Sugira os três principais diagnósticos diferenciais, além do diagnóstico principal fornecido, levando em conta obrigatoriamente os achados radiológicos (${findings ?? "não especificado"}) e os dados clínicos disponíveis. ${DIAG_NOT_REVEALED}\n${FEEDBACK_INSTRUCTION}\nSiga exatamente este formato JSON:
{
  "answer_options": ["Diagnóstico Principal", "Diagnóstico Diferencial 1", "Diagnóstico Diferencial 2", "Diagnóstico Diferencial 3"],
  "answer_feedbacks": ["Feedback para o principal", "Feedback diferencial 1", "Feedback diferencial 2", "Feedback diferencial 3"],
  "answer_short_tips": ["Dica sobre o principal", "Dica diferencial 1", "Dica diferencial 2", "Dica diferencial 3"]
}
Importante: Não explique na resposta geral, use só os campos acima. A alternativa A sempre será o diagnóstico principal.`
    },
    {
      role: "user",
      content: `Diagnóstico principal: ${diagnosis ?? "-"}; Achados radiológicos: ${findings ?? "-"}; Modalidade: ${modality ?? "-"}; Subtipo: ${subtype ?? "-"}`
    }
  ];
}

function buildPromptFindings({ diagnosis, modality, subtype, systemPrompt }) {
  const promptFindings = systemPrompt
    ? `${systemPrompt}\n${DIAG_NOT_REVEALED}`
    : `Você é especialista em radiologia. Gere uma descrição de achados radiológicos concisa (máx. 200 caracteres), integrando diagnóstico e modalidade. ${DIAG_NOT_REVEALED}`;
  return [
    { role: "system", content: promptFindings },
    { role: "user", content: `Diagnóstico: ${diagnosis ?? "-"}; Modalidade: ${modality ?? "-"}; Subtipo: ${subtype ?? "-"}` }
  ];
}

function buildPromptClinicalInfo({ diagnosis, modality, subtype, systemPrompt }) {
  const promptClinical = systemPrompt
    ? `${systemPrompt}\n${DIAG_NOT_REVEALED}`
    : `Você é especialista em radiologia. Gere um resumo clínico objetivo e sucinto (máximo 300 caracteres), integrando diagnóstico e modalidade. ${DIAG_NOT_REVEALED}`;
  return [
    { role: "system", content: promptClinical },
    { role: "user", content: `Diagnóstico: ${diagnosis ?? "-"}; Modalidade: ${modality ?? "-"}; Subtipo: ${subtype ?? "-"}` }
  ];
}

function buildPromptHint({ diagnosis, findings, modality, subtype, systemPrompt }) {
  const promptHint = systemPrompt
    ? `${systemPrompt}\n${DIAG_NOT_REVEALED}`
    : `Você é um especialista em radiologia. Forneça uma dica super concisa (máx. 200 caracteres) para ajudar o estudante a resolver o caso, integrando achado radiológico e contexto clínico. Não seja genérico. ${DIAG_NOT_REVEALED}`;
  return [
    { role: "system", content: promptHint },
    { role: "user", content: `Diagnóstico: ${diagnosis ?? "-"}; Achados radiológicos: ${findings ?? "-"}; Modalidade: ${modality ?? "-"}; Subtipo: ${subtype ?? "-"}` }
  ];
}

// Atualiza a geração do PROMPT para incluir contexto
// Exemplo para preenchimento completo:
function buildPromptFullCase({ diagnosis, findings, modality, subtype, similarCasesContext = "" }) {
  let contextIntro = `Você é um especialista em radiologia e diagnóstico por imagem que elabora casos clínico-radiológicos objetivamente para quizzes de ensino, valorizando sempre integração entre achados de imagem e quadro clínico.`;
  contextIntro += ` Nas explicações e feedbacks, responda DE FORMA EXTREMAMENTE BREVE, SEM frases genéricas, usando sempre apenas a relação entre os achados radiológicos e sintomas ou contexto clínico.`;
  contextIntro += ` Nunca faça textos longos ou divagações.`;
  contextIntro += ` ${DIAG_NOT_REVEALED}`;
  if (findings || modality || subtype) {
    contextIntro += ` Dados do caso: `;
    if (modality) contextIntro += `Modalidade: ${modality}. `;
    if (subtype) contextIntro += `Subtipo: ${subtype}. `;
    if (findings) contextIntro += `Achados radiológicos: ${findings}. `;
  }
  // Adiciona os exemplos reais no contexto do prompt
  if (similarCasesContext) {
    contextIntro += `\n\n${similarCasesContext}\n`;
  }

  const finalSystemPrompt = `
${contextIntro}
Com base no DIAGNÓSTICO de referência abaixo, preencha somente o JSON com todos os campos do caso clínico de maneira FUNDAMENTADA E COMPLETA, detalhando SEM ENROLAR e evitando resumir excessivamente, e sempre integrando achados, contexto e raciocínio.

${FEEDBACK_INSTRUCTION}

Estruture assim:
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
+ Cada campo em "answer_feedbacks" deve ser em TOM MOTIVACIONAL E INCENTIVADOR, direcionado ao estudante, com até 100 caracteres CADA, um texto diferente para cada alternativa (veja exemplos). Use emoções, elogios ou dicas construtivas sempre.
+ O feedback de cada alternativa deve também descrever o achado principal daquela alternativa e correlacionar esse achado com o do caso.
+ O campo "explanation" pode ter até 2-3 frases, totalizando até 300 caracteres, SEM frases genéricas.
+ "findings" e "patient_clinical_info" até 300 caracteres, completando sempre que possível, mas sem verbosidade inútil.
+ Priorize a integração entre achados, sintomas e explicação do diagnóstico.
+ Use os exemplos abaixo como guia:
${EXAMPLES}
+ NÃO repita textos prontos. NÃO use frases vagas como "Consulte o contexto". Cada alternativa recebe um feedback único e detalhado.
+ O diagnóstico correto é sempre alternativa A.
`;

  return [
    { role: "system", content: finalSystemPrompt },
    { role: "user", content: `Diagnóstico de referência: ${diagnosis}` }
  ];
}

// Handlers de tratamento da resposta da IA
function tryParseJsonFromCompletion(raw: string) {
  const match = raw.match(/\{[\s\S]*\}/);
  const jsonString = match ? match[0] : raw;
  return JSON.parse(jsonString);
}

function trimFieldsOnPayload(payload: any) {
  if (typeof payload.explanation === "string") {
    payload.explanation = payload.explanation.trim().slice(0, 300);
  }
  if (typeof payload.findings === "string") {
    payload.findings = payload.findings.trim().slice(0, 300);
  }
  if (typeof payload.patient_clinical_info === "string") {
    payload.patient_clinical_info = payload.patient_clinical_info.trim().slice(0, 300);
  }
  if (Array.isArray(payload.answer_feedbacks)) {
    const motivExemplos = [
      "Ótima escolha! Você fez uma excelente correlação clínica-imagem.",
      "Quase! Reveja os sintomas principais e compare com os achados.",
      "Continue tentando! Analise com atenção as alterações radiológicas.",
      "Não desanime! Cada erro é um passo para o aprendizado."
    ];
    payload.answer_feedbacks = payload.answer_feedbacks.map((f: string, i: number) =>
      typeof f === "string" && f.trim()
        ? f.trim().slice(0, 100)
        : motivExemplos[i % motivExemplos.length]
    );
  }
  if (Array.isArray(payload.answer_short_tips)) {
    payload.answer_short_tips = payload.answer_short_tips.map((f: string) =>
      typeof f === "string" ? f.trim().slice(0, 200) : ""
    );
  }
  return payload;
}

// Servidor principal (atualiza para usar os casos similares)
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagnosis, findings, modality, subtype, withAlternativesOnly, withHintOnly, systemPrompt, withFindingsOnly, withClinicalInfoOnly } = await req.json();

    // Alternativas (diagnósticos diferenciais + feedbacks)
    if (withAlternativesOnly) {
      try {
        const messages = buildPromptAlternatives({ diagnosis, findings, modality, subtype });
        const raw = await getOpenAISuggestion({ messages, max_tokens: 300, temperature: 0.7 });
        const payload = tryParseJsonFromCompletion(raw);
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
        return new Response(
          JSON.stringify({ error: "API did not return a valid JSON for diffs", raw: e.message }),
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

    // Preenchimento completo — inclui contexto automático
    {
      // Busca casos similares antes de gerar prompt
      const similarCases = await fetchSimilarCases({ diagnosis, findings, modality });
      const contextFromCases = buildContextFromSimilarCases(similarCases);

      try {
        const messages = buildPromptFullCase({ diagnosis, findings, modality, subtype, similarCasesContext: contextFromCases });
        const raw = await getOpenAISuggestion({ messages, max_tokens: 700, temperature: 0.7 });
        const payload = tryParseJsonFromCompletion(raw);
        trimFieldsOnPayload(payload);

        // LOG: Registrar o prompt e o contexto real enviado
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
