import React, { useEffect, useState } from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { MedicalCasesTable } from "./components/MedicalCasesTable";
import { useMedicalCases } from "./hooks/useMedicalCases";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

// Removido: função gerarCasosFake e seu uso

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
      {/* O formulário de cadastro de novos casos */}
      <CaseProfileForm onCreated={refreshCases} />
      {/* Abaixo foi removido: 
          - Título "Casos Cadastrados"
          - Filtros das especialidades e modalidades
          - Tabela dos casos cadastrados 
      */}
    </div>
  );
}
