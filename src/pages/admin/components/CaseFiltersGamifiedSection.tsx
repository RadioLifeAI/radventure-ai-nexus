
import React, { useState } from "react";
import { CaseFiltersSelector } from "./CaseFiltersSelector";
import { CaseFiltersSelectorSearchBar } from "./CaseFiltersSelectorSearchBar";
import { CaseFiltersSelectorQuickActions } from "./CaseFiltersSelectorQuickActions";

export function CaseFiltersGamifiedSection({ value, onChange }: { value: any, onChange: (v: any) => void }) {
  // Busca local para modalidades/categorias
  const [search, setSearch] = useState("");
  
  function handleQuickSelect(option: string) {
    if (option === "clear") {
      onChange({ ...value, specialty: [], modality: [], subtype: [], difficulty: [] });
    } else if (option === "all-tc") {
      onChange({ ...value, modality: ["Tomografia Computadorizada (TC)"] });
    } else if (option === "all-rx") {
      onChange({ ...value, modality: ["Radiografia (RX)"] });
    } else if (option === "all-rm") {
      onChange({ ...value, modality: ["Ressonância Magnética (RM)"] });
    } else if (option === "neuro") {
      onChange({ ...value, specialty: ["Neurorradiologia"] });
    } else if (option === "torax") {
      onChange({ ...value, specialty: ["Radiologia Torácica"] });
    } else if (option === "abdome") {
      onChange({ ...value, specialty: ["Radiologia Abdominal"] });
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Filtros de Casos (Dados Reais)</h3>
        <CaseFiltersSelectorQuickActions onQuickSelect={handleQuickSelect} />
        <CaseFiltersSelectorSearchBar 
          placeholder="Buscar especialidade/modalidade..." 
          onChange={setSearch} 
        />
        <CaseFiltersSelector value={value} onChange={onChange} searchTerm={search} />
      </div>
    </div>
  );
}
