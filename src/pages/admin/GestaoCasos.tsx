
import React from "react";
import { useMedicalCases } from "./hooks/useMedicalCases";
import { MedicalCasesTable } from "./components/MedicalCasesTable";
import { CasesManagementHeader } from "@/components/admin/cases/CasesManagementHeader";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { Loader } from "@/components/Loader";

export default function GestaoCasos() {
  const { cases, loading, deleteCase } = useMedicalCases();

  return (
    <div className="space-y-6">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <BackToDashboard variant="back" />
        <div className="text-sm text-gray-500">
          {cases.length} casos cadastrados
        </div>
      </div>

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
