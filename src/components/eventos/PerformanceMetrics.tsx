
import React from "react";
import { TrendingUp } from "lucide-react";

export function PerformanceMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Performance por Especialidade</h4>
        <div className="space-y-3">
          {['Neurologia', 'Cardiologia', 'Radiologia'].map((specialty, index) => (
            <div key={specialty} className="flex items-center justify-between">
              <span className="text-cyan-100">{specialty}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-white/20 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    style={{ width: `${(3 - index) * 30}%` }}
                  ></div>
                </div>
                <span className="text-white text-sm">{(3 - index) * 30}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Tendências Semanais</h4>
        <div className="space-y-3">
          {['Participação', 'Pontuação Média', 'Novos Usuários'].map((metric, index) => (
            <div key={metric} className="flex items-center justify-between">
              <span className="text-cyan-100">{metric}</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm">+{(index + 1) * 5}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
