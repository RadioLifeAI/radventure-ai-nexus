
import React from "react";
import { FileText, Sparkles, Brain, Target } from "lucide-react";

export function CasesManagementHeader() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white mb-6 shadow-xl">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative px-8 py-12">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm shadow-lg">
            <FileText className="h-8 w-8 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              Gestão de Casos Médicos
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </h1>
            <p className="text-green-100 text-lg font-medium">
              Crie e gerencie casos de radiologia com IA avançada
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-green-500/80 px-4 py-2 rounded-full shadow-md">
                <Brain className="h-4 w-4" />
                <span className="text-sm font-semibold">IA Integrada</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/80 px-4 py-2 rounded-full shadow-md">
                <Target className="h-4 w-4" />
                <span className="text-sm font-semibold">Casos Gamificados</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
