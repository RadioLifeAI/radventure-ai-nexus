
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Sparkles, Zap } from "lucide-react";

interface EventFormHeaderProps {
  mode: "create" | "edit";
  onShowTemplates: () => void;
}

export function EventFormHeader({ mode, onShowTemplates }: EventFormHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white mb-6">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative px-8 py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
              <Calendar className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                {mode === "create" ? "Criar Novo Evento" : "Editar Evento"}
                <Sparkles className="h-8 w-8 text-yellow-300" />
              </h1>
              <p className="text-blue-100 text-lg">
                Configure eventos gamificados de radiologia com IA
              </p>
            </div>
          </div>
          <div className="text-right">
            <Button 
              type="button" 
              variant="outline"
              onClick={onShowTemplates}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
              size="lg"
            >
              <Zap className="h-5 w-5 mr-2" />
              Templates Rápidos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
