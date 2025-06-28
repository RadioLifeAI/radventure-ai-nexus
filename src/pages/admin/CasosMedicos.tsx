
import React from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { CasesManagementHeader } from "@/components/admin/cases/CasesManagementHeader";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";

export default function CasosMedicos() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="space-y-6 p-6">
        {/* Navegação com fundo claro */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <BackToDashboard variant="back" />
          <div className="text-sm text-gray-600 font-medium">
            Criar novo caso médico
          </div>
        </div>

        <CasesManagementHeader />
        
        {/* Container principal com fundo branco garantido */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Formulário de Caso Médico</h2>
            <p className="text-gray-600">Preencha todos os campos para criar um novo caso médico</p>
          </div>
          <div className="p-6 bg-white">
            <CaseProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
}
