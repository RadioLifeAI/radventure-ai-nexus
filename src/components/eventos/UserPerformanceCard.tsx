
import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEventMetrics } from "@/hooks/useEventMetrics";

export function UserPerformanceCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { metrics } = useEventMetrics();

  if (!user) {
    return (
      <div className="bg-white/5 rounded-lg p-4 text-center">
        <h4 className="font-medium text-white mb-3">Faça Login para Ver Suas Estatísticas</h4>
        <Button onClick={() => navigate("/login")} className="bg-cyan-600 hover:bg-cyan-700">
          Fazer Login
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <h4 className="font-medium text-white mb-3">Seu Desempenho</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">{metrics.userRegistrations}</div>
          <div className="text-sm text-cyan-200">Eventos Inscritos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{metrics.userCompletedEvents}</div>
          <div className="text-sm text-cyan-200">Eventos Concluídos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {metrics.userCompletedEvents > 0 
              ? Math.round((metrics.userCompletedEvents / metrics.userRegistrations) * 100) 
              : 0}%
          </div>
          <div className="text-sm text-cyan-200">Taxa de Conclusão</div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <Button 
          onClick={() => navigate("/app/conquistas")}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Ver Minhas Conquistas
        </Button>
      </div>
    </div>
  );
}
