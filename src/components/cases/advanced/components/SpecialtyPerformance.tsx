
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { RealUserStats } from "@/hooks/useRealUserStats";

interface Props {
  stats: RealUserStats;
}

export function SpecialtyPerformance({ stats }: Props) {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-green-400" />
          Performance por Especialidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.specialtyBreakdown.slice(0, 6).map((specialty, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">{specialty.specialty}</span>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={specialty.accuracy >= 80 ? "default" : specialty.accuracy >= 60 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {specialty.accuracy}%
                  </Badge>
                  <span className="text-sm text-cyan-200">
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
      </CardContent>
    </Card>
  );
}
