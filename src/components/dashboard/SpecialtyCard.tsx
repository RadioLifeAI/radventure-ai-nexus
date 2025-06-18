
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getSpecialtyData } from "@/data/specialtyIcons";
import { Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { FeatureInDevelopmentModal } from "@/components/modal/FeatureInDevelopmentModal";

interface SpecialtyCardProps {
  specialty: {
    id?: number;
    name: string;
    cases: number;
    userProgress?: {
      total: number;
      correct: number;
      accuracy: number;
    };
  };
}

export const SpecialtyCard = React.memo(function SpecialtyCard({ specialty }: SpecialtyCardProps) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  
  const specialtyData = React.useMemo(() => getSpecialtyData(specialty.name), [specialty.name]);
  
  const handleExplore = React.useCallback(() => {
    // Se não há casos disponíveis, mostrar modal
    if (specialty.cases === 0) {
      setShowModal(true);
      return;
    }
    
    // Navegar para casos com filtro de especialidade - CORRIGIDO
    navigate(`/app/casos?specialty=${encodeURIComponent(specialty.name)}`);
  }, [specialty.cases, specialty.name, navigate]);

  const accuracy = specialty.userProgress?.accuracy || 0;
  const hasProgress = (specialty.userProgress?.total || 0) > 0;

  const progressBadgeClassName = React.useMemo(() => {
    return `flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
      accuracy >= 80 ? 'bg-green-500 text-white' :
      accuracy >= 60 ? 'bg-yellow-500 text-white' :
      'bg-red-500 text-white'
    }`;
  }, [accuracy]);

  const progressBarClassName = React.useMemo(() => {
    return `h-2 rounded-full transition-all duration-500 ${
      accuracy >= 80 ? 'bg-green-500' :
      accuracy >= 60 ? 'bg-yellow-500' :
      'bg-red-500'
    }`;
  }, [accuracy]);

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-2xl ${specialtyData.gradient} ${specialtyData.borderColor} border-2 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-1`}
        onClick={handleExplore}
      >
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        
        {/* Sparkle effect on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>

        {/* Progress indicator */}
        {hasProgress && (
          <div className="absolute top-3 left-3">
            <div className={progressBadgeClassName}>
              <TrendingUp className="h-3 w-3" />
              {accuracy}%
            </div>
          </div>
        )}

        <div className="relative p-6 flex flex-col h-full min-h-[180px]">
          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-md group-hover:scale-110 transition-transform duration-300">
              {specialtyData.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1 group-hover:text-gray-900 transition-colors">
                {specialty.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {specialtyData.description}
              </p>
            </div>
          </div>

          {/* Progress Stats */}
          {hasProgress && (
            <div className="mb-3 p-2 bg-white/60 backdrop-blur-sm rounded-lg">
              <div className="text-xs text-gray-700 mb-1">Seu Progresso</div>
              <div className="flex justify-between text-sm font-semibold text-gray-800">
                <span>{specialty.userProgress?.correct}/{specialty.userProgress?.total}</span>
                <span>{accuracy}% precisão</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={progressBarClassName}
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats and Action */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="bg-white/60 backdrop-blur-sm text-gray-700 font-semibold"
              >
                {specialty.cases} caso{specialty.cases !== 1 ? 's' : ''}
              </Badge>
              {specialty.cases > 0 ? (
                <Badge 
                  variant="outline" 
                  className="border-green-300 text-green-700 bg-green-50/80"
                >
                  Disponível
                </Badge>
              ) : (
                <Badge 
                  variant="outline" 
                  className="border-orange-300 text-orange-700 bg-orange-50/80"
                >
                  Em breve
                </Badge>
              )}
            </div>

            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                handleExplore();
              }}
            >
              <span className="mr-2">
                {specialty.cases > 0 ? (hasProgress ? 'Continuar' : 'Explorar') : 'Em breve'}
              </span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      <FeatureInDevelopmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        featureName={`${specialty.name}`}
        description={`Os casos de ${specialty.name} estão sendo preparados com conteúdo de alta qualidade e tecnologia IA avançada.`}
      />
    </>
  );
});
