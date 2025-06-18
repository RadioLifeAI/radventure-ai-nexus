
import { useState } from "react";

const INITIAL_FORM = {
  category_id: "",
  difficulty_level: "",
  points: "10",
  modality: "",
  subtype: "",
  title: "",
  findings: "",
  patient_age: "",
  patient_gender: "",
  symptoms_duration: "",
  patient_clinical_info: "",
  main_question: "",
  explanation: "",
  answer_options: ["", "", "", ""],
  answer_feedbacks: ["", "", "", ""],
  answer_short_tips: ["", "", "", ""],
  correct_answer_index: 0,
  image_url: [],
  can_skip: true,
  max_elimination: 0,
  ai_hint_enabled: false,
  manual_hint: "",
  skip_penalty_points: 0,
  elimination_penalty_points: 0,
  ai_tutor_level: "desligado",
  case_number: null as number | null,
  diagnosis_internal: "",
  // Campos de referência Radiopaedia
  is_radiopaedia_case: false,
  reference_citation: "",
  reference_url: "",
  access_date: "",
  
  // Novos campos estruturados - Diagnóstico
  primary_diagnosis: "",
  secondary_diagnoses: [] as string[],
  case_classification: "diagnostico",
  cid10_code: "",
  
  // Achados radiológicos estruturados
  anatomical_regions: [] as string[],
  finding_types: [] as string[],
  laterality: "",
  
  // Resumo clínico estruturado
  main_symptoms: [] as string[],
  vital_signs: {} as Record<string, any>,
  medical_history: [] as string[],
  
  // Sistema de tags e metadados
  learning_objectives: [] as string[],
  pathology_types: [] as string[],
  clinical_presentation_tags: [] as string[],
  case_complexity_factors: [] as string[],
  search_keywords: [] as string[],
  structured_metadata: {} as Record<string, any>,
  
  // Gamificação avançada
  case_rarity: "comum",
  educational_value: 5,
  clinical_relevance: 5,
  estimated_solve_time: 5,
  prerequisite_cases: [] as string[],
  unlocks_cases: [] as string[],
  achievement_triggers: {} as Record<string, any>,
  
  // Sistema de filtros inteligentes
  target_audience: [] as string[],
  medical_subspecialty: [] as string[],
  exam_context: "rotina",
  differential_diagnoses: [] as string[],
  similar_cases_ids: [] as string[]
};

export function useCaseProfileFormState() {
  const [form, setForm] = useState(INITIAL_FORM);

  const resetForm = () => setForm(INITIAL_FORM);

  return { form, setForm, resetForm };
}
