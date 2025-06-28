
import React from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { CasesManagementHeader } from "@/components/admin/cases/CasesManagementHeader";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";

export default function CasosMedicos() {
  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-full">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <BackToDashboard variant="back" />
        <div className="text-sm text-gray-500">
          Criar novo caso médico
        </div>
      </div>

      <CasesManagementHeader />
      
      <div className="bg-white rounded-lg shadow-lg border border-gray-100">
        <CaseProfileForm />
      </div>
    </div>
  );
}
