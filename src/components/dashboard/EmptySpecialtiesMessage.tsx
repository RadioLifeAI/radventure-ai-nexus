
import React from "react";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function EmptySpecialtiesMessage() {
  const navigate = useNavigate();

  return (
    <section className="w-full mt-8 mb-4 text-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-colors duration-300">
        <Brain className="h-16 w-16 text-cyan-300 mx-auto mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-white mb-2">
          Especialidades em Preparação
        </h3>
        <p className="text-cyan-200 mb-4">
          Estamos organizando os casos médicos por especialidade.
        </p>
        <Button 
          onClick={() => navigate('/admin/casos-medicos')} 
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          Adicionar Casos
        </Button>
      </div>
    </section>
  );
}
