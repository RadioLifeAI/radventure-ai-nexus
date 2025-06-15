
import React from "react";

type Props = {
  form: any;
};

export function CaseQualityRadar({ form }: Props) {
  // Qualidade fictícia baseada em critérios simples
  const hasAll = form.category_id && form.difficulty_level && form.modality && form.diagnosis_internal && form.findings && form.answer_options?.filter((x:string) => x?.length > 0).length === 4;
  const tips = [];
  if (!form.modality) tips.push("Preencha a modalidade para dicas mais personalizadas");
  if (!form.findings) tips.push("Adicione achados radiológicos relevantes");
  if (!form.patient_clinical_info) tips.push("Inclua um resumo clínico");
  if ((form.answer_options || []).some((x:string)=>!x)) tips.push("Complete todas as alternativas");
  if (form.answer_options && new Set(form.answer_options).size !== 4) tips.push("Evite alternativas repetidas");

  return (
    <div className="flex flex-col items-start mb-3">
      <div className="font-bold text-sm flex items-center gap-1">
        <span>Radar de Qualidade:</span>
        <span className={`ml-2 text-xs px-2 py-0.5 rounded ${hasAll ? "bg-cyan-100 text-cyan-700" : "bg-yellow-100 text-yellow-700"}`}>
          {hasAll ?
            "Excelente preenchimento!" :
            "Pode melhorar"}
        </span>
      </div>
      {tips.length > 0 && (
        <ul className="text-xs mt-1 text-yellow-700 px-2 list-disc list-inside">
          {tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      )}
    </div>
  );
}
