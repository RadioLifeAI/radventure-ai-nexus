
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RealUserStats } from "@/hooks/useRealUserStats";

interface Props {
  stats: RealUserStats;
}

export function SpecialtyPerformance({ stats }: Props) {
  return (
    <div className="space-y-4">
      {stats.specialtyBreakdown.slice(0, 6).map((specialty, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">{specialty.specialty}</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant={specialty.accuracy >= 80 ? "default" : specialty.accuracy >= 60 ? "secondary" : "destructive"}
                className="text-xs"
              >
                {specialty.accuracy}%
              </Badge>
              <span className="text-sm text-gray-500">
                {specialty.cases} casos
              </span>
            </div>
          </div>
          <Progress 
            value={specialty.accuracy} 
            className="h-2"
          />
        </div>
      ))}
    </div>
  );
}
