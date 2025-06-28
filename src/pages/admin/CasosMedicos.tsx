
import React from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { CasesManagementHeader } from "@/components/admin/cases/CasesManagementHeader";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";

export default function CasosMedicos() {
  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Navegação */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
        <BackToDashboard variant="back" />
        <div className="text-sm text-gray-600 font-medium">
          Criar novo caso médico
        </div>
      </div>

      <CasesManagementHeader />
      
      {/* Container principal com fundo claro garantido */}
      <div className="bg-white rounded-lg shadow-lg p-6 mx-auto max-w-7xl">
        <CaseProfileForm />
      </div>
    </div>
  );
}
