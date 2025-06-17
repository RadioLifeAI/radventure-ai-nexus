
import React from "react";
import { BarChart3, Sparkles, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardAnalyticsHeaderProps {
  totalUsers?: number;
  activeEvents?: number;
  totalCases?: number;
}

export function DashboardAnalyticsHeader({ totalUsers = 0, activeEvents = 0, totalCases = 0 }: DashboardAnalyticsHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white mb-6">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative px-8 py-12">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
            <BarChart3 className="h-8 w-8 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              Analytics Dashboard
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </h1>
            <p className="text-violet-100 text-lg">
              Métricas e insights da plataforma de radiologia
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge className="bg-indigo-500/80 text-white px-3 py-1">
                <Users className="h-4 w-4 mr-1" />
                {totalUsers} usuários
              </Badge>
              <Badge className="bg-purple-500/80 text-white px-3 py-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {activeEvents} eventos ativos
              </Badge>
              <Badge className="bg-violet-500/80 text-white px-3 py-1">
                <BarChart3 className="h-4 w-4 mr-1" />
                {totalCases} casos
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
