
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RealUserStats } from "@/hooks/useRealUserStats";

interface Props {
  stats: RealUserStats;
}

export function SpecialtyPerformance({ stats }: Props) {
  // Converter Record para array corretamente
  const specialtyArray = Object.entries(stats.specialtyBreakdown).map(([specialty, data]) => ({
    specialty,
    total: data.total,
    correct: data.correct,
    accuracy: data.accuracy,
    points: data.points
  }));

  return (
    <div className="space-y-4">
      {specialtyArray.slice(0, 6).map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-white">{item.specialty}</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant={item.accuracy >= 80 ? "default" : item.accuracy >= 60 ? "secondary" : "destructive"}
                className={`text-xs ${
                  item.accuracy >= 80 
                    ? "bg-green-500/20 text-green-400 border-green-400/30" 
                    : item.accuracy >= 60 
                    ? "bg-blue-500/20 text-blue-400 border-blue-400/30" 
                    : "bg-red-500/20 text-red-400 border-red-400/30"
                }`}
              >
                {item.accuracy}%
              </Badge>
              <span className="text-sm text-cyan-200">
                {item.total} casos
              </span>
            </div>
          </div>
          <Progress 
            value={item.accuracy} 
            className="h-2 bg-white/10"
          />
        </div>
      ))}
    </div>
  );
}
