
import React from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { MedicalCasesTable } from "./components/MedicalCasesTable";
import { useMedicalCases } from "./hooks/useMedicalCases";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

/**
 * Função para gerar rapidamente 10 casos fake no banco (para testes)
 */
async function gerarCasosFake() {
  const TITULOS = [
    "Pneumonia em Imagem", "Fratura de Úmero", "Lesão Pulmonar", "Apendicite Aguda",
    "AVC Isquêmico", "Cisto Renal", "Neoplasia de Mama", "Colecistite", "Asma Grave", "Derrame Pleural"
  ];
  const SPECIALTIES = ["Radiologia", "Clínica Médica", "Ortopedia"];
  const MODALIDADES = ["Tomografia Computadorizada (TC)", "Radiografia (RX)", "Ultrassonografia (US)"];
  const QUES = ["Qual o diagnóstico provável?", "Qual a conduta?", "Identifique o achado principal."];
  const FEEDBACKS = [
    ["Correto! Clínica clássica para esse achado.", "Alternativa equivocada.", "Revise os sinais de imagem.", "Discussão detalhada nas diretrizes."],
    ["Boa! Diagnóstico frequente.", "Não é o achado esperado.", "Fique atento às variantes.", "Analise o contexto clínico."],
    ["Parabéns pela assertividade!", "Resposta incompleta.", "Estude mais sobre o tema.", "Conferir imagem com atenção."]
  ];
  const getRand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  const mockCases = Array.from({ length: 10 }).map((_, idx) => ({
    title: getRand(TITULOS) + " #" + (Math.floor(Math.random() * 1000)),
    specialty: getRand(SPECIALTIES),
    category_id: 1,
    difficulty_level: (Math.floor(Math.random() * 4) + 1),
    points: (Math.floor(Math.random() * 3) + 1) * 10,
    modality: getRand(MODALIDADES),
    subtype: "",
    findings: "Achado típico evidente na imagem em " + getRand(MODALIDADES),
    patient_age: 27 + idx,
    patient_gender: idx % 2 === 0 ? "Masculino" : "Feminino",
    symptoms_duration: idx + 1 + " dias",
    patient_clinical_info: "Paciente com quadro clínico sugestivo para o diagnóstico.",
    main_question: getRand(QUES),
    answer_options: ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
    answer_feedbacks: getRand(FEEDBACKS),
    answer_short_tips: ["Reflita sobre anatomia.", "Atenção para o contexto.", "Revise epidemiologia.", ""],
    correct_answer_index: Math.floor(Math.random() * 4),
    image_url: "",
    explanation: "Explicação resumo para aprendizado.",
    can_skip: true,
    max_elimination: 1,
    ai_hint_enabled: false,
    manual_hint: "Dica extra para o usuário.",
    skip_penalty_points: 0,
    elimination_penalty_points: 0,
    ai_tutor_level: "desligado",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    case_number: idx + 1000
  }));
  const { error } = await supabase.from("medical_cases").insert(mockCases);
  if (!error) {
    toast({ title: "Casos de teste gerados!" });
    window.location.reload();
  } else {
    toast({ title: "Erro ao gerar casos!", variant: "destructive" });
  }
}

export default function CasosMedicos() {
  const { cases, loading, refreshCases, deleteCase, editCase } = useMedicalCases();

  return (
    <div>
      {/* Botão temporário para gerar casos fake, remova se não quiser mais */}
      <div className="mb-3">
        <Button type="button" variant="secondary" onClick={gerarCasosFake}>
          Gerar 10 Casos Dummy
        </Button>
      </div>
      <CaseProfileForm onCreated={refreshCases} />
      <h3 className="text-xl font-bold mb-3 mt-12">Casos Cadastrados</h3>
      <MedicalCasesTable cases={cases} onDelete={deleteCase} onEdit={editCase} />
    </div>
  );
}
