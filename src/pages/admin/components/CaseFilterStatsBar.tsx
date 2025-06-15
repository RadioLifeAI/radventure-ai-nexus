
import React from "react";
import { Trophy, Award, Timer, SearchCheck } from "lucide-react";

export function CaseFilterStatsBar({ stats, loading }: {
  stats: { count: number, difficulty: number },
  loading: boolean
}) {
  return (
    <div className="flex items-center gap-5 bg-gray-50 rounded-xl px-3 py-1 mb-2 text-sm shadow-sm animate-fade-in">
      <div className="flex items-center gap-1 text-blue-700 font-semibold">
        <SearchCheck size={16} className="mr-1" />
        Casos encontrados:{" "}
        <span className="ml-1">{loading ? "..." : stats.count}</span>
      </div>
      <div className="flex items-center gap-1 text-purple-800">
        <Award size={16} className="mr-1" />
        Dificuldade média: <span className="ml-1">{loading ? "..." : stats.difficulty?.toFixed(1) || "-"}</span>
      </div>
      <div className="flex items-center gap-1 text-yellow-800">
        <Trophy size={16} className="mr-1" />
        Sugestão prêmio: <span className="ml-1">{loading ? "..." : Math.min(2000, Math.max(100, stats.count * 30))} RC</span>
      </div>
      <div className="flex items-center gap-1 text-green-800">
        <Timer size={16} className="mr-1" />
        Sugestão tempo: <span className="ml-1">{loading ? "..." : stats.count * 2} min</span>
      </div>
    </div>
  );
}
