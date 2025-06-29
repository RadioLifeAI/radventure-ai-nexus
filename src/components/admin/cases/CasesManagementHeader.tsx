
import React from "react";
import { FileText, Sparkles, Brain, Target } from "lucide-react";

export function CasesManagementHeader() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="absolute inset-0 bg-black/5"></div>
      <div className="relative px-8 py-12">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
            <FileText className="h-8 w-8 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              Gestão de Casos Médicos
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </h1>
            <p className="text-blue-100 text-lg">
              Crie e gerencie casos de radiologia com tecnologia avançada
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <Brain className="h-5 w-5" />
                <span className="text-sm font-semibold">IA Integrada</span>
              </div>
              <div className="flex items-center gap-2 bg-indigo-400/40 px-4 py-2 rounded-full backdrop-blur-sm">
                <Target className="h-5 w-5" />
                <span className="text-sm font-semibold">Casos Gamificados</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
