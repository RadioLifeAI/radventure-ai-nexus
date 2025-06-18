
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

type ProgressProps = {
  form: any;
};

export function CaseProgressDashboard({ form }: ProgressProps) {
  // Seções do formulário com seus campos obrigatórios
  const sections = [
    {
      name: "Básico",
      required: ["category_id", "difficulty_level", "modality", "title"],
      color: "blue"
    },
    {
      name: "Estruturado", 
      required: ["primary_diagnosis", "case_classification"],
      optional: ["anatomical_regions", "pathology_types", "finding_types"],
      color: "cyan"
    },
    {
      name: "Quiz",
      required: ["main_question", "answer_options"],
      color: "yellow"
    },
    {
      name: "Clínico",
      required: ["findings", "patient_clinical_info"],
      color: "green"
    },
    {
      name: "Explicação",
      required: ["explanation"],
      color: "purple"
    }
  ];

  const calculateSectionProgress = (section: any) => {
    const requiredFilled = section.required.filter((field: string) => {
      const value = form[field];
      if (Array.isArray(value)) return value.length > 0;
      if (field === "answer_options") return value && value.filter((opt: string) => opt?.trim()).length >= 2;
      return value && String(value).trim() !== "";
    }).length;

    const optionalFilled = (section.optional || []).filter((field: string) => {
      const value = form[field];
      if (Array.isArray(value)) return value.length > 0;
      return value && String(value).trim() !== "";
    }).length;

    const totalRequired = section.required.length;
    const totalOptional = section.optional?.length || 0;
    
    return {
      required: requiredFilled,
      totalRequired,
      optional: optionalFilled,
      totalOptional,
      percentage: Math.round((requiredFilled / totalRequired) * 100)
    };
  };

  const overallProgress = sections.map(calculateSectionProgress);
  const totalCompleted = overallProgress.reduce((sum, prog) => sum + prog.required, 0);
  const totalRequired = overallProgress.reduce((sum, prog) => sum + prog.totalRequired, 0);
  const overallPercentage = Math.round((totalCompleted / totalRequired) * 100);

  // Verificar qualidade geral
  const hasAdvancedFields = form.anatomical_regions?.length > 0 || 
                           form.pathology_types?.length > 0 || 
                           form.learning_objectives?.length > 0;
  
  const qualityLevel = overallPercentage >= 90 && hasAdvancedFields ? "premium" :
                      overallPercentage >= 70 ? "good" : "basic";

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Progresso do Caso
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-3 w-32 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-indigo-800">
            {overallPercentage}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        {sections.map((section, index) => {
          const progress = overallProgress[index];
          const isComplete = progress.percentage === 100;
          
          return (
            <div 
              key={section.name}
              className={`p-2 rounded-lg border-2 transition-colors ${
                isComplete 
                  ? `bg-${section.color}-100 border-${section.color}-300` 
                  : `bg-gray-50 border-gray-200`
              }`}
            >
              <div className="flex items-center gap-1">
                {isComplete ? (
                  <CheckCircle className={`h-4 w-4 text-${section.color}-600`} />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={`text-xs font-medium ${
                  isComplete ? `text-${section.color}-800` : "text-gray-600"
                }`}>
                  {section.name}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {progress.required}/{progress.totalRequired}
                {progress.totalOptional > 0 && (
                  <span className="text-gray-400">
                    {" "}(+{progress.optional})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {qualityLevel === "premium" && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              ⭐ Caso Premium
            </Badge>
          )}
          {qualityLevel === "good" && (
            <Badge className="bg-blue-500 text-white">
              ✅ Boa Qualidade
            </Badge>
          )}
          {overallPercentage === 100 && (
            <Badge className="bg-green-500 text-white animate-pulse">
              🚀 Pronto para Publicar!
            </Badge>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          {totalCompleted}/{totalRequired} campos obrigatórios
        </div>
      </div>
    </div>
  );
}
