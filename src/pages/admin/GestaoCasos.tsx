
import React from "react";
import { useMedicalCases } from "./hooks/useMedicalCases";
import { MedicalCasesTable } from "./components/MedicalCasesTable";
import { CasesManagementHeader } from "@/components/admin/cases/CasesManagementHeader";
import { Loader } from "@/components/Loader";

export default function GestaoCasos() {
  const { cases, loading, deleteCase } = useMedicalCases();

  return (
    <div className="space-y-6">
      <CasesManagementHeader />
      <div className="bg-white rounded-lg shadow-lg p-6">
        {loading ? (
          <Loader />
        ) : (
          <MedicalCasesTable cases={cases} onDelete={deleteCase} />
        )}
      </div>
    </div>
  );
}
