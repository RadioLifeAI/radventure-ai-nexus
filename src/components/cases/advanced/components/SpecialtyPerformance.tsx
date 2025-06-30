
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RealUserStats } from "@/hooks/useRealUserStats";

interface Props {
  stats: RealUserStats;
}

export function SpecialtyPerformance({ stats }: Props) {
  // Converter Record para array
  const specialtyArray = Object.entries(stats.specialtyBreakdown).map(([specialty, data]) => ({
    specialty,
    ...data,
    cases: data.total // Mapear total para cases para compatibilidade
  }));

  return (
    <div className="space-y-4">
      {specialtyArray.slice(0, 6).map(([specialty, data], index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-white">{specialty}</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant={data.accuracy >= 80 ? "default" : data.accuracy >= 60 ? "secondary" : "destructive"}
                className={`text-xs ${
                  data.accuracy >= 80 
                    ? "bg-green-500/20 text-green-400 border-green-400/30" 
                    : data.accuracy >= 60 
                    ? "bg-blue-500/20 text-blue-400 border-blue-400/30" 
                    : "bg-red-500/20 text-red-400 border-red-400/30"
                }`}
              >
                {data.accuracy}%
              </Badge>
              <span className="text-sm text-cyan-200">
                {data.total} casos
              </span>
            </div>
          </div>
          <Progress 
            value={data.accuracy} 
            className="h-2 bg-white/10"
          />
        </div>
      ))}
    </div>
  );
}
