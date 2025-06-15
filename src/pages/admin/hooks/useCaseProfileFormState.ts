
import { useState } from "react";

/**
 * Hook para o estado do formulário de case profile.
 * Pode ser expandido para lógica de validação, etc.
 */
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
  image_url: "",
  can_skip: true,
  max_elimination: 0,
  ai_hint_enabled: false,
  manual_hint: "",
  skip_penalty_points: 0,
  elimination_penalty_points: 0,
  ai_tutor_level: "desligado",
  case_number: null as number | null
};

export function useCaseProfileFormState() {
  const [form, setForm] = useState(INITIAL_FORM);

  const resetForm = () => setForm(INITIAL_FORM);

  return { form, setForm, resetForm };
}

