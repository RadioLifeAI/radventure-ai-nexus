
import React from "react";
import { useMedicalCases } from "./hooks/useMedicalCases";
import { MedicalCasesTable } from "./components/MedicalCasesTable";
import { Loader } from "@/components/Loader";

export default function GestaoCasos() {
  const { cases, loading, deleteCase } = useMedicalCases();

  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Gestão de Casos</h2>
      {loading ? (
        <Loader />
      ) : (
        <MedicalCasesTable cases={cases} onDelete={deleteCase} />
      )}
    </div>
  );
}
