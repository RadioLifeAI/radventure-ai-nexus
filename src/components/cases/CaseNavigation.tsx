
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, List, Shuffle } from "lucide-react";

interface CaseNavigationProps {
  currentIndex: number;
  totalCases: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onShowList?: () => void;
  currentCase?: {
    title: string;
    specialty: string;
    difficulty_level: number;
  };
}

export function CaseNavigation({
  currentIndex,
  totalCases,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onShowList,
  currentCase
}: CaseNavigationProps) {
  const progress = totalCases > 0 ? ((currentIndex + 1) / totalCases) * 100 : 0;

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-white/20 text-white">
            {currentIndex + 1} de {totalCases}
          </Badge>
          {currentCase && (
            <div className="text-sm text-cyan-100">
              <span className="font-medium">{currentCase.specialty}</span>
              <span className="mx-2">•</span>
              <span>Nível {currentCase.difficulty_level}</span>
            </div>
          )}
        </div>
        
        {onShowList && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowList}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-cyan-200 mb-1">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={onNext}
          disabled={!hasNext}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
        >
          Próximo
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
