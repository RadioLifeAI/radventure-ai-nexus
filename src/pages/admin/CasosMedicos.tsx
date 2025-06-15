import React, { useEffect, useState } from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { MedicalCasesTable } from "./components/MedicalCasesTable";
import { useMedicalCases } from "./hooks/useMedicalCases";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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
  const GENDERS = ["Masculino", "Feminino"];
  const getRand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

  const mockCases = Array.from({ length: 10 }).map((_, idx) => {
    const answer_options = ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"];
    return {
      title: getRand(TITULOS) + " #" + (Math.floor(Math.random() * 1000)),
      specialty: getRand(SPECIALTIES),
      category_id: 1,
      difficulty_level: (Math.floor(Math.random() * 4) + 1),
      modality: getRand(MODALIDADES),
      findings: "Achado típico evidente na imagem em " + getRand(MODALIDADES),
      symptoms_duration: (idx + 1) + " dias",
      patient_clinical_info: "Paciente com quadro clínico sugestivo para o diagnóstico.",
      main_question: getRand(QUES),
      answer_options,
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
      patient_age: String(25 + idx), // <-- Corrigido: agora é string!
      patient_gender: getRand(GENDERS),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  try {
    const { error } = await supabase.from("medical_cases").insert(mockCases);
    if (!error) {
      toast({ title: "Casos de teste gerados!" });
      window.location.reload();
    } else {
      toast({ title: "Erro ao gerar casos! " + error.message, variant: "destructive" });
      console.error("Erro ao gerar casos dummy:", error);
    }
  } catch (err: any) {
    toast({ title: "Erro inesperado ao gerar casos!", variant: "destructive" });
    console.error("Erro interno (gerarCasosFake):", err);
  }
}

export default function CasosMedicos() {
  // Estado dos filtros (usar "all" como padrão)
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [specialties, setSpecialties] = useState<{id: number, name: string}[]>([]);
  const [modalities, setModalities] = useState<string[]>([]);

  // Buscar as opções de especialidade/modealidade ao iniciar
  useEffect(() => {
    supabase.from("medical_specialties").select("id, name").then(({ data }) => setSpecialties(data || []));
    // Modalidades são um campo texto livre, buscar distintas salvas
    supabase.from("medical_cases").select("modality").then(({ data }) => {
      if (data) {
        const setModal = Array.from(new Set(data.map(x => x.modality).filter(Boolean)));
        setModalities(setModal.length ? setModal : []);
      }
    });
  }, []);

  // Traduzir "all" para "" (sem filtro) ao passar para o hook
  const filterCategory = categoryFilter === "all" ? "" : categoryFilter;
  const filterModality = modalityFilter === "all" ? "" : modalityFilter;

  // Chamar o hook de casos passando os filtros
  const { cases, loading, refreshCases, deleteCase, editCase } = useMedicalCases({ categoryFilter: filterCategory, modalityFilter: filterModality });

  return (
    <div>
      {/* Botão temporário para gerar casos fake */}
      <div className="mb-3">
        <Button type="button" variant="secondary" onClick={gerarCasosFake}>
          Gerar 10 Casos Dummy
        </Button>
      </div>
      <CaseProfileForm onCreated={refreshCases} />
      <h3 className="text-xl font-bold mb-5 mt-12">Casos Cadastrados</h3>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filtrar por especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Especialidades</SelectItem>
              {specialties.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.name)}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={modalityFilter} onValueChange={setModalityFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filtrar por modalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {modalities.length === 0 ? "Modalidade Principal" : "Todas Modalidades"}
              </SelectItem>
              {modalities.length > 0 &&
                modalities.map((mod) => (
                  <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <MedicalCasesTable cases={cases} onDelete={deleteCase} onEdit={editCase} />
    </div>
  );
}
