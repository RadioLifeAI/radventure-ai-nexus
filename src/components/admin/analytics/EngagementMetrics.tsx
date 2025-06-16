
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

export function EngagementMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Métricas de Engajamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">Taxa de Conclusão</div>
            <Progress value={75} className="mb-2" />
            <div className="text-xs text-gray-500">75% dos casos são concluídos</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Tempo Médio por Caso</div>
            <Progress value={60} className="mb-2" />
            <div className="text-xs text-gray-500">3.2 minutos em média</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Retenção Semanal</div>
            <Progress value={85} className="mb-2" />
            <div className="text-xs text-gray-500">85% retornam na semana</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
