
import React from "react";

type ProgressProps = {
  form: any;
};

export function CaseProgressDashboard({ form }: ProgressProps) {
  // Calcula progresso baseado nas principais seções obrigatórias preenchidas
  const totalFields = 7;
  let completed = 0;
  if (form.category_id) completed++;
  if (form.difficulty_level) completed++;
  if (form.points) completed++;
  if (form.modality) completed++;
  if (form.diagnosis_internal) completed++;
  if (form.findings) completed++;
  if (form.patient_clinical_info) completed++;

  const percent = Math.round((completed / totalFields) * 100);

  return (
    <div className="flex flex-row items-center gap-3 mb-4">
      <div className="h-2 w-40 bg-gray-200 rounded overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-600 transition-all"
          style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs font-semibold text-cyan-800">{percent}% completo</span>
      {percent === 100 && (
        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs animate-scale-in">Pronto para salvar!</span>
      )}
    </div>
  );
}
