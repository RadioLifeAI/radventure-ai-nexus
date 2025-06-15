
import React, { useState } from "react";
import { CaseFiltersSelector } from "./CaseFiltersSelector";
import { CaseFiltersSelectorSearchBar } from "./CaseFiltersSelectorSearchBar";
import { CaseFiltersSelectorQuickActions } from "./CaseFiltersSelectorQuickActions";
import { CaseFiltersPreviewCases } from "./CaseFiltersPreviewCases";

export function CaseFiltersGamifiedSection({ value, onChange }: { value: any, onChange: (v: any) => void }) {
  // Busca local para modalidades/categorias
  const [search, setSearch] = useState("");
  function handleQuickSelect(option: string) {
    if (option === "clear") onChange({ ...value, modality: [], subtype: [] });
    else if (option === "all-tc") onChange({ ...value, modality: ["Tomografia Computadorizada (TC)"] });
    else if (option === "all-rx") onChange({ ...value, modality: ["Radiografia (RX)"] });
    else if (option === "all-rm") onChange({ ...value, modality: ["Ressonância Magnética (RM)"] });
  }

  return (
    <div>
      <CaseFiltersSelectorQuickActions onQuickSelect={handleQuickSelect} />
      <CaseFiltersSelectorSearchBar placeholder="Buscar especialidade/modalidade..." onChange={setSearch} />
      <CaseFiltersPreviewCases filters={value} />
      <CaseFiltersSelector value={value} onChange={onChange} />
    </div>
  );
}
