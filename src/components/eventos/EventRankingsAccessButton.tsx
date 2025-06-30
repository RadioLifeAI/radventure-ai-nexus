
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EventRankingsAccessButtonProps {
  className?: string;
  variant?: "default" | "compact" | "floating";
}

export function EventRankingsAccessButton({ 
  className = "", 
  variant = "default" 
}: EventRankingsAccessButtonProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/app/ranking-eventos");
  };

  if (variant === "compact") {
    return (
      <Button
        onClick={handleNavigate}
        variant="outline"
        size="sm"
        className={`bg-white/90 border-yellow-300 hover:bg-yellow-50 text-yellow-700 hover:text-yellow-800 ${className}`}
      >
        <Trophy className="h-4 w-4 mr-2" />
        Rankings
      </Button>
    );
  }

  if (variant === "floating") {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={handleNavigate}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full w-14 h-14 p-0"
        >
          <Crown className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Rankings de Eventos</h3>
            <p className="text-sm text-gray-600">
              Veja performances, conquistas e o Hall da Fama
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            onClick={handleNavigate}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Rankings
          </Button>
          <div className="flex gap-1">
            <Badge className="bg-yellow-100 text-yellow-700 text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Hall da Fama
            </Badge>
            <Badge className="bg-orange-100 text-orange-700 text-xs">
              Tempo Real
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
