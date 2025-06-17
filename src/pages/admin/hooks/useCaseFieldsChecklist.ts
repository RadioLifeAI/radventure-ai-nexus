
// CHECKLIST COMPLETO DOS CAMPOS DO FORMULÁRIO DE CASOS MÉDICOS
// Para verificar cobertura da API de auto-preenchimento

export interface CaseFormFields {
  // === CAMPOS BÁSICOS OBRIGATÓRIOS ===
  category_id: string;           // ✅ API: suggestion.category (mapeado para ID)
  difficulty_level: string;     // ✅ API: suggestion.difficulty 
  points: string;               // ✅ API: suggestion.points (ou calculado por dificuldade)
  modality: string;             // ✅ API: suggestion.modality
  subtype: string;              // ✅ API: suggestion.subtype
  title: string;                // ✅ GERADO: automaticamente por categoria + número
  diagnosis_internal: string;   // ✅ API: entrada do usuário (revisado pela API)

  // === CAMPOS DE CONTEÚDO CLÍNICO ===
  findings: string;             // ✅ API: suggestion.findings
  patient_clinical_info: string; // ✅ API: suggestion.patient_clinical_info
  main_question: string;        // ✅ API: suggestion.main_question
  explanation: string;          // ✅ API: suggestion.explanation

  // === DADOS DO PACIENTE ===
  patient_age: string;          // ✅ API: suggestion.patient_age
  patient_gender: string;       // ✅ API: suggestion.patient_gender
  symptoms_duration: string;    // ✅ API: suggestion.symptoms_duration

  // === ALTERNATIVAS E RESPOSTAS ===
  answer_options: string[];     // ✅ API: suggestion.answer_options (4 opções)
  answer_feedbacks: string[];   // ✅ API: suggestion.answer_feedbacks (4 feedbacks)
  answer_short_tips: string[];  // ✅ API: suggestion.answer_short_tips (4 dicas)
  correct_answer_index: number; // ✅ API: calculado após embaralhamento

  // === IMAGENS ===
  image_url: Array<{url: string, legend: string}>; // ❌ NÃO COBERTO: precisa upload manual

  // === CONFIGURAÇÕES AVANÇADAS ===
  can_skip: boolean;            // ✅ API: buildAutoAdvancedFields()
  max_elimination: number;      // ✅ API: buildAutoAdvancedFields()
  ai_hint_enabled: boolean;     // ✅ API: buildAutoAdvancedFields()
  manual_hint: string;          // ✅ API: suggestion.manual_hint ou gerado
  skip_penalty_points: number;  // ✅ API: buildAutoAdvancedFields()
  elimination_penalty_points: number; // ✅ API: buildAutoAdvancedFields()
  ai_tutor_level: string;       // ✅ API: buildAutoAdvancedFields()

  // === CAMPOS GERADOS AUTOMATICAMENTE ===
  case_number: number | null;   // ✅ GERADO: automaticamente por categoria
  created_at: string;          // ✅ SISTEMA: timestamp automático
  updated_at: string;          // ✅ SISTEMA: timestamp automático
}

// === STATUS DA COBERTURA DA API ===
export const API_COVERAGE_STATUS = {
  FULLY_COVERED: [
    'category_id', 'difficulty_level', 'points', 'modality', 'subtype',
    'findings', 'patient_clinical_info', 'main_question', 'explanation',
    'patient_age', 'patient_gender', 'symptoms_duration',
    'answer_options', 'answer_feedbacks', 'answer_short_tips', 'correct_answer_index',
    'can_skip', 'max_elimination', 'ai_hint_enabled', 'manual_hint',
    'skip_penalty_points', 'elimination_penalty_points', 'ai_tutor_level'
  ],
  AUTO_GENERATED: [
    'title', 'case_number', 'created_at', 'updated_at'
  ],
  MANUAL_ONLY: [
    'image_url' // Requer upload manual pelo usuário
  ],
  USER_INPUT: [
    'diagnosis_internal' // Campo preenchido pelo usuário, mas revisado pela API
  ]
};

// === VERIFICAÇÃO DE ESPECIALIDADES APÓS MIGRAÇÃO ===
export const UPDATED_SPECIALTIES = [
  'Cardiologia', 'Cirurgia', 'Clínica Médica', 'Dermatologia', 'Endocrinologia',
  'Gastroenterologia', // UNIFICADO: era Gastrointestinal
  'Ginecologia e Obstetrícia', // UNIFICADO: era Ginecologia + Obstetrícia
  'Hematologia', 'Infectologia', 'Medicina de Emergência', 'Nefrologia',
  'Neurologia', 'Ortopedia', 'Pediatria', 'Pneumologia', 'Psiquiatria',
  'Reumatologia', 'Urologia', 'Radiologia Geral', 'Neurorradiologia',
  'Radiologia Torácica', // UNIFICADO: era Tórax
  'Radiologia Abdominal', // UNIFICADO: era Abdome
  'Radiologia Musculoesquelética', 'Radiologia Mamária', 'Radiologia Pediátrica',
  'Radiologia Intervencionista', // UNIFICADO: era Intervencionista
  'Medicina Nuclear', 'Ultrassonografia', 'Cabeça e Pescoço', 'Coluna',
  'Hepatobiliar', 'Saúde da Mulher', 'Trauma', 'Vascular', 'Oncologia', 'Outros'
];

// === MAPEAMENTO PARA COMPATIBILIDADE ===
export const SPECIALTY_MAPPING = {
  'Gastrointestinal': 'Gastroenterologia',
  'Ginecologia': 'Ginecologia e Obstetrícia',
  'Obstetrícia': 'Ginecologia e Obstetrícia',
  'Intervencionista': 'Radiologia Intervencionista',
  'Tórax': 'Radiologia Torácica',
  'Abdome': 'Radiologia Abdominal'
};

export function validateAPIResponse(suggestion: any): {
  missing: string[];
  invalid: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  // Verificar campos essenciais
  if (!suggestion.category) missing.push('category');
  if (!suggestion.difficulty) missing.push('difficulty');
  if (!suggestion.modality) missing.push('modality');
  if (!suggestion.findings) missing.push('findings');
  if (!suggestion.patient_clinical_info) missing.push('patient_clinical_info');
  if (!suggestion.main_question) missing.push('main_question');
  if (!suggestion.explanation) missing.push('explanation');

  // Verificar arrays de alternativas
  if (!Array.isArray(suggestion.answer_options) || suggestion.answer_options.length !== 4) {
    invalid.push('answer_options (deve ter 4 itens)');
  }
  if (!Array.isArray(suggestion.answer_feedbacks) || suggestion.answer_feedbacks.length !== 4) {
    invalid.push('answer_feedbacks (deve ter 4 itens)');
  }

  // Verificar especialidade após migração
  if (suggestion.category && !UPDATED_SPECIALTIES.includes(suggestion.category)) {
    warnings.push(`Especialidade '${suggestion.category}' pode precisar de mapeamento`);
  }

  return { missing, invalid, warnings };
}
