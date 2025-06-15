
// utils.ts

export function tryParseJsonFromCompletion(raw: string) {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    const jsonString = match ? match[0] : raw;
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Erro ao fazer parse do JSON: ${err.message}. RAW: ${raw.slice(0, 500)}`);
  }
}

export function trimFieldsOnPayload(payload: any) {
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
    payload.answer_feedbacks = payload.answer_feedbacks.map((f: string, i: number) =>
      typeof f === "string" && f.trim()
        ? f.trim().slice(0, 100)
        : ""
    );
  }
  if (Array.isArray(payload.answer_short_tips)) {
    payload.answer_short_tips = payload.answer_short_tips.map((f: string) =>
      typeof f === "string" ? f.trim().slice(0, 200) : ""
    );
  }
  return payload;
}
