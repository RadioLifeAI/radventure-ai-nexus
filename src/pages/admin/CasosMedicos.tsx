
import React from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { MedicalCasesTable } from "./components/MedicalCasesTable";
import { useMedicalCases } from "./hooks/useMedicalCases";

export default function CasosMedicos() {
  const { cases, loading, refreshCases } = useMedicalCases();

  return (
    <div>
      <CaseProfileForm onCreated={refreshCases} />
      <h3 className="text-xl font-bold mb-3 mt-12">Casos Cadastrados</h3>
      <MedicalCasesTable cases={cases} />
    </div>
  );
}
