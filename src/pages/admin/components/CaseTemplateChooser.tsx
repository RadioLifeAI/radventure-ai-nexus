
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Heart, 
  Bone, 
  Zap, 
  BookOpen, 
  Target,
  Clock,
  AlertTriangle,
  Microscope,
  Activity
} from "lucide-react";

type Props = {
  setForm: (form: any) => void;
};

// Templates inteligentes para radiologia
const CASE_TEMPLATES = [
  {
    id: "trauma_tc",
    name: "TC de Trauma",
    icon: <Zap className="h-5 w-5" />,
    color: "red",
    description: "Caso de emergência com TC para trauma",
    tags: ["Emergencial", "TC", "Trauma"],
    template: {
      modality: "Tomografia Computadorizada",
      case_classification: "emergencial",
      exam_context: "urgencia",
      anatomical_regions: ["Crânio", "Tórax"],
      pathology_types: ["Traumático"],
      clinical_presentation_tags: ["Agudo", "Emergencial"],
      case_complexity_factors: ["Múltiplas lesões", "Urgência"],
      target_audience: ["Residência R1", "Residência R2"],
      educational_value: 8,
      clinical_relevance: 9,
      estimated_solve_time: 3,
      main_symptoms: ["Dor", "Trauma"],
      case_rarity: "comum"
    }
  },
  {
    id: "pneumonia_rx",
    name: "Pneumonia - RX Tórax",
    icon: <Heart className="h-5 w-5" />,
    color: "blue",
    description: "Caso didático de pneumonia em radiografia",
    tags: ["Didático", "RX", "Pneumologia"],
    template: {
      modality: "Radiografia",
      subtype: "Tórax PA",
      case_classification: "diagnostico",
      exam_context: "rotina",
      anatomical_regions: ["Pulmões"],
      pathology_types: ["Infeccioso"],
      clinical_presentation_tags: ["Febril", "Agudo"],
      finding_types: ["Consolidação"],
      main_symptoms: ["Febre", "Tosse", "Dispneia"],
      learning_objectives: ["Reconhecer consolidação", "Diferenciar pneumonia de outras causas"],
      target_audience: ["Graduação", "Residência R1"],
      educational_value: 7,
      clinical_relevance: 8,
      estimated_solve_time: 5,
      case_rarity: "comum"
    }
  },
  {
    id: "fratura_membro",
    name: "Fratura - RX Ortopédico",
    icon: <Bone className="h-5 w-5" />,
    color: "orange",
    description: "Caso ortopédico com fratura óssea",
    tags: ["Ortopedia", "RX", "Trauma"],
    template: {
      modality: "Radiografia",
      case_classification: "diagnostico",
      exam_context: "urgencia",
      anatomical_regions: ["Membros Superiores"],
      pathology_types: ["Traumático"],
      finding_types: ["Fratura"],
      clinical_presentation_tags: ["Traumático", "Dor"],
      main_symptoms: ["Dor", "Edema", "Limitação funcional"],
      learning_objectives: ["Identificar fraturas", "Classificar tipos de fratura"],
      target_audience: ["Graduação", "Residência R1"],
      educational_value: 6,
      clinical_relevance: 7,
      estimated_solve_time: 4,
      case_rarity: "comum"
    }
  },
  {
    id: "rm_neurologico",
    name: "RM Neurológica",
    icon: <Brain className="h-5 w-5" />,
    color: "purple",
    description: "Caso avançado de ressonância magnética neurológica",
    tags: ["Avançado", "RM", "Neurologia"],
    template: {
      modality: "Ressonância Magnética",
      case_classification: "diagnostico",
      exam_context: "ambulatorio",
      anatomical_regions: ["Crânio"],
      pathology_types: ["Neoplásico", "Vascular"],
      clinical_presentation_tags: ["Crônico", "Neurológico"],
      case_complexity_factors: ["Múltiplas sequências", "Achado sutil"],
      main_symptoms: ["Cefaleia", "Déficit neurológico"],
      learning_objectives: ["Interpretar RM cerebral", "Reconhecer lesões complexas"],
      target_audience: ["Residência R2", "Residência R3", "Especialização"],
      educational_value: 9,
      clinical_relevance: 9,
      estimated_solve_time: 8,
      case_rarity: "raro"
    }
  },
  {
    id: "abdome_tc",
    name: "TC de Abdome",
    icon: <Activity className="h-5 w-5" />,
    color: "green",
    description: "Tomografia de abdome com contraste",
    tags: ["TC", "Abdome", "Contraste"],
    template: {
      modality: "Tomografia Computadorizada",
      subtype: "Abdome com contraste",
      case_classification: "diagnostico",
      exam_context: "rotina",
      anatomical_regions: ["Abdome"],
      pathology_types: ["Inflamatório", "Neoplásico"],
      clinical_presentation_tags: ["Dor abdominal"],
      main_symptoms: ["Dor abdominal", "Náuseas"],
      learning_objectives: ["Interpretar TC abdominal", "Reconhecer patologias abdominais"],
      target_audience: ["Residência R1", "Residência R2"],
      educational_value: 7,
      clinical_relevance: 8,
      estimated_solve_time: 6,
      case_rarity: "comum"
    }
  },
  {
    id: "caso_raro",
    name: "Caso Raro Especializado",
    icon: <Microscope className="h-5 w-5" />,
    color: "pink",
    description: "Caso raro para especialistas",
    tags: ["Raro", "Especializado", "Desafiador"],
    template: {
      case_classification: "diferencial",
      exam_context: "ambulatorio",
      pathology_types: ["Raro", "Congênito"],
      clinical_presentation_tags: ["Raro", "Atípico"],
      case_complexity_factors: ["Apresentação atípica", "Diagnóstico desafiador"],
      learning_objectives: ["Reconhecer patologia rara", "Ampliar diagnósticos diferenciais"],
      target_audience: ["Residência R3", "Especialização", "Educação Continuada"],
      educational_value: 10,
      clinical_relevance: 6,
      estimated_solve_time: 12,
      case_rarity: "muito_raro"
    }
  }
];

export function CaseTemplateChooser({ setForm }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const applyTemplate = (template: any) => {
    setForm((prev: any) => ({
      ...prev,
      ...template.template,
      // Preservar campos já preenchidos importantes
      title: prev.title || "",
      findings: prev.findings || "",
      patient_clinical_info: prev.patient_clinical_info || "",
      main_question: prev.main_question || "",
      explanation: prev.explanation || ""
    }));
    setSelectedTemplate(template.id);
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-indigo-600" />
        <h3 className="font-bold text-gray-900">Templates Inteligentes</h3>
        <Badge className="bg-indigo-500 text-white">Radiologia</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {CASE_TEMPLATES.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md border-2 ${
              selectedTemplate === template.id 
                ? `border-${template.color}-500 bg-${template.color}-50`
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => applyTemplate(template)}
          >
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm flex items-center gap-2 text-${template.color}-700`}>
                {template.icon}
                {template.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-gray-600 mb-2">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className={`text-xs bg-${template.color}-100 text-${template.color}-700`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              {selectedTemplate === template.id && (
                <div className="mt-2 p-2 bg-green-100 rounded border border-green-200">
                  <div className="text-xs font-medium text-green-800 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Template aplicado!
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <div className="text-xs text-blue-800">
          <strong>💡 Dica:</strong> Escolha um template para preencher automaticamente os campos estruturados 
          baseados no tipo de caso radiológico. Você pode personalizar depois!
        </div>
      </div>
    </div>
  );
}
