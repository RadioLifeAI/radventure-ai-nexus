
// prompts.ts

const DIAG_NOT_REVEALED = "REGRAS IMPORTANTES: NUNCA integre, cite, sugira ou deduza o diagnóstico principal nos campos do caso clínico, inclusive achados, resumo clínico, pergunta principal, alternativas etc. Os campos devem fornecer apenas contexto, sem nunca revelar, sugerir ou favorecer o diagnóstico correto. Redija como em um caso real, SEM ENTREGAR a resposta. NÃO USE termos que sejam sinônimos, cognatos, sugestivos ou relacionados ao diagnóstico - seja completamente neutro.";

const FEEDBACK_INSTRUCTION = `
Em cada campo de "answer_feedbacks", além do tom MOTIVACIONAL, faça também:
- uma breve descrição do achado referente àquela alternativa
- e uma CORRELAÇÃO desse achado com o achado radiológico principal do caso.
Ou seja: não seja genérico – faça o estudante entender por que a alternativa está certa ou errada relacionando clinicamente e radiologicamente.
`;

const STRICT_DIAGNOSIS_HIDING = `
REGRAS RÍGIDAS PARA OCULTAR DIAGNÓSTICO:
- JAMAIS mencione direta ou indiretamente o diagnóstico
- NÃO use sinônimos do diagnóstico
- NÃO use termos cognatos ou derivados
- NÃO use termos sugestivos ou relacionados
- NÃO use expressões que direcionem para o diagnóstico
- Seja completamente neutro e objetivo
- Descreva apenas achados observáveis sem interpretação diagnóstica
- Use linguagem técnica neutra sem revelar conclusões
`;

export function buildPromptAlternatives({ diagnosis, findings, modality, subtype }) {
  return [
    {
      role: "system",
      content:
        `Você é um especialista em radiologia e diagnóstico por imagem, focado em criar casos clínico-radiológicos objetivos para quizzes. Sugira os três principais diagnósticos diferenciais, além do diagnóstico principal fornecido, levando em conta obrigatoriamente os achados radiológicos (${findings ?? "não especificado"}) e os dados clínicos disponíveis. ${DIAG_NOT_REVEALED} ${STRICT_DIAGNOSIS_HIDING}\n${FEEDBACK_INSTRUCTION}\nSiga exatamente este formato JSON:
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

export function buildPromptFindings({ diagnosis, modality, subtype, systemPrompt }) {
  const personaPrompt = `Você é um(a) radiologista com título em Radiologia, reconhecido(a) mundialmente por sua excelência em diagnóstico por imagem e ensino médico. Seu objetivo é descrever de forma objetiva, clara e altamente profissional os achados radiológicos encontrados em exames de imagem.`;

  const restriction = `${DIAG_NOT_REVEALED} ${STRICT_DIAGNOSIS_HIDING}\nNunca revele, cite, deduza ou sugira explicitamente o diagnóstico correto nos achados, apenas descreva o que está presente nas imagens de forma completamente neutra.`;

  const userPrompt =
    systemPrompt
      ? `${systemPrompt}\n${restriction}`
      : `${personaPrompt}\nGere uma descrição de achados radiológicos objetiva, estruturada e sucinta (máx. 200 caracteres), utilizando linguagem técnica avançada, mas sem qualquer menção, sugestão ou dedução do diagnóstico final. Apenas os achados detectados, sem interpretações clínicas ou diagnósticas. ${restriction}`;
  return [
    { role: "system", content: userPrompt },
    { role: "user", content: `Diagnóstico: ${diagnosis ?? "-"}; Modalidade: ${modality ?? "-"}; Subtipo: ${subtype ?? "-"}` }
  ];
}

export function buildPromptClinicalInfo({ diagnosis, modality, subtype, systemPrompt }) {
  const promptClinical = systemPrompt
    ? `${systemPrompt}\n${DIAG_NOT_REVEALED} ${STRICT_DIAGNOSIS_HIDING}`
    : `Você é especialista em radiologia. Gere um resumo clínico objetivo e sucinto (máximo 300 caracteres), integrando informações do paciente sem revelar diagnóstico. ${DIAG_NOT_REVEALED} ${STRICT_DIAGNOSIS_HIDING}`;
  return [
    { role: "system", content: promptClinical },
    { role: "user", content: `Diagnóstico: ${diagnosis ?? "-"}; Modalidade: ${modality ?? "-"}; Subtipo: ${subtype ?? "-"}` }
  ];
}

export function buildPromptHint({ diagnosis, findings, modality, subtype, systemPrompt }) {
  const promptHint = systemPrompt
    ? `${systemPrompt}\n${DIAG_NOT_REVEALED} ${STRICT_DIAGNOSIS_HIDING}`
    : `Você é um especialista em radiologia. Forneça uma dica super concisa (máx. 200 caracteres) para ajudar o estudante a resolver o caso, integrando achado radiológico e contexto clínico sem revelar o diagnóstico. Não seja genérico e não use termos relacionados ao diagnóstico. ${DIAG_NOT_REVEALED} ${STRICT_DIAGNOSIS_HIDING}`;
  return [
    { role: "system", content: promptHint },
    { role: "user", content: `Diagnóstico: ${diagnosis ?? "-"}; Achados radiológicos: ${findings ?? "-"}; Modalidade: ${modality ?? "-"}; Subtipo: ${subtype ?? "-"}` }
  ];
}

export function buildPromptFullCase({ diagnosis, findings, modality, subtype }) {
  let contextIntro = `Você é um especialista em radiologia e diagnóstico por imagem que elabora casos clínico-radiológicos integrando contexto clínico, achados de imagem e opções pedagógicas para quizzes.`;
  contextIntro += ` Nas explicações e feedbacks, responda DE FORMA OBJETIVA, SEM frases genéricas, sempre explicando a relação entre os achados radiológicos, sintomas e contexto.`;
  contextIntro += ` ${DIAG_NOT_REVEALED} ${STRICT_DIAGNOSIS_HIDING}`;
  
  contextIntro += `\nIMPORTANTE:`
    + `\n- O campo "category" corresponde à ESPECIALIDADE MÉDICA principal à qual o caso se refere (por exemplo: Pneumologia, Neurologia, Gastroenterologia).`
    + `\n- O campo "modality" corresponde ao EXAME DE IMAGEM principal no qual os achados radiológicos do caso estão baseados (por exemplo: Radiografia de Tórax, Tomografia Computadorizada, Ressonância Magnética).`;

  if (findings || modality || subtype) {
    contextIntro += ` Dados do caso: `;
    if (modality) contextIntro += `Modalidade: ${modality}. `;
    if (subtype) contextIntro += `Subtipo: ${subtype}. `;
    if (findings) contextIntro += `Achados radiológicos: ${findings}. `;
  }

  const finalSystemPrompt = `
${contextIntro}
Com base no diagnóstico de referência abaixo, preencha SOMENTE o JSON abaixo sugerindo de forma lógica, fundamentada e realista TODOS os campos do caso clínico, inclusive os avançados. NÃO USE valores fixos/exemplo — cada valor deve ser coerente com o contexto, complexidade, modalidade e utilidade didática do caso.

REGRAS CRÍTICAS PARA TODOS OS CAMPOS:
- NÃO mencione, sugira ou insinue o diagnóstico em NENHUM campo
- NÃO use sinônimos, cognatos ou termos relacionados ao diagnóstico
- Seja completamente neutro e objetivo
- Descreva apenas achados observáveis sem interpretação diagnóstica

Siga EXATAMENTE esta estrutura de resposta (retorne TODOS os campos):

{
  "category": "",
  "difficulty": "", // nível de 1 a 4 conforme a complexidade
  "points": "",
  "modality": "",
  "subtype": "",
  "findings": "", // APENAS achados observáveis, sem mencionar diagnóstico
  "patient_clinical_info": "", // História clínica neutra, sem revelar diagnóstico
  "patient_age": "",
  "patient_gender": "",
  "symptoms_duration": "",
  "main_question": "", // Pergunta neutra que não revele o diagnóstico
  "answer_options": ["", "", "", ""],
  "answer_feedbacks": ["", "", "", ""],
  "answer_short_tips": ["", "", "", ""],
  "explanation": "", // Explicação que NÃO revele o diagnóstico nos outros campos
  "can_skip": true,
  "max_elimination": "", // sugerido logicamente pela IA
  "ai_hint_enabled": true,
  "manual_hint": "", // Dica neutra que NÃO revele diagnóstico
  "skip_penalty_points": "", // penalidades sugeridas logicamente
  "elimination_penalty_points": "", // idem acima
  "ai_tutor_level": "" // SEMPRE escolha "basico" ou "detalhado" conforme dificuldade do caso
}

REGRAS:
- Preencha TODOS os campos acima lógica e pedagogicamente
- O campo "ai_tutor_level" deve ser sempre "basico" ou "detalhado" por padrão
- Campos avançados devem ser fundamentados com o objetivo de aprendizado considerando dificuldade, penalidade, utilidade do AI tutor, etc
- "manual_hint" precisa ser curta, integrada e útil ao estudante MAS sem revelar o diagnóstico
- Não use textos repetidos, padronizados ou genéricos
- O diagnóstico correto é SEMPRE alternativa A
- JAMAIS revele o diagnóstico em nenhum campo exceto nas alternativas

Retorne apenas o JSON.
`;

  return [
    { role: "system", content: finalSystemPrompt },
    { role: "user", content: `Diagnóstico de referência: ${diagnosis}` }
  ];
}
