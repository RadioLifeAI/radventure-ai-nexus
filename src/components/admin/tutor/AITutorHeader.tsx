
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain, Plus, Sparkles, Crown } from "lucide-react";

interface AITutorHeaderProps {
  onNewConfig: () => void;
}

export function AITutorHeader({ onNewConfig }: AITutorHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative px-8 py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
              <Brain className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                Gestão do Tutor IA
                <Sparkles className="h-8 w-8 text-yellow-300" />
              </h1>
              <p className="text-purple-100 text-lg">
                Configure e monitore o sistema de tutoria por IA
              </p>
            </div>
          </div>
          <div className="text-right">
            <Button 
              onClick={onNewConfig}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Configuração
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
