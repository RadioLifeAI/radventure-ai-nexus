
import React from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { CasesManagementHeader } from "@/components/admin/cases/CasesManagementHeader";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function CasosMedicos() {
  console.log('🏥 CasosMedicos: Componente iniciando renderização');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="space-y-6 p-6">
        {/* Navegação com fundo claro garantido */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <BackToDashboard variant="back" />
          <div className="text-sm text-gray-600 font-medium">
            Criar novo caso médico
          </div>
        </div>

        <CasesManagementHeader />
        
        {/* Container principal com fundo branco garantido e z-index otimizado */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative z-10">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Formulário de Caso Médico</h2>
            <p className="text-gray-600">Preencha todos os campos para criar um novo caso médico</p>
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
