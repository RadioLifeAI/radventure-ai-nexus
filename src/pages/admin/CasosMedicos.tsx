
import React from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { CasesManagementHeader } from "@/components/admin/cases/CasesManagementHeader";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function CasosMedicos() {
  console.log('🏥 CasosMedicos: Sistema unificado iniciando');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="space-y-6 p-6">
        {/* Navegação com fundo claro garantido */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <BackToDashboard variant="back" />
          <div className="text-sm text-gray-600 font-medium">
            Sistema Unificado - Criar novo caso médico
          </div>
        </div>

        <CasesManagementHeader />
        
        {/* Container principal com sistema unificado */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative z-10">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sistema Unificado de Casos Médicos</h2>
            <p className="text-gray-600">
              Upload direto, sem complexidade - um único sistema para criação e edição
            </p>
          </div>
          <div className="p-6 bg-white">
            <TooltipProvider delayDuration={0}>
              <CaseProfileForm />
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
