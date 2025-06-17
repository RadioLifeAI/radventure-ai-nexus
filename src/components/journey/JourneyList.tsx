
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Edit, 
  Trash2, 
  Clock, 
  Target, 
  CheckCircle,
  BookOpen,
  Trophy
} from "lucide-react";
import { useJourneyManagement } from "@/hooks/useJourneyManagement";

interface JourneyListProps {
  onStartJourney: (journey: any) => void;
  onEditJourney?: (journey: any) => void;
}

export function JourneyList({ onStartJourney, onEditJourney }: JourneyListProps) {
  const { journeys, isLoading, deleteJourney } = useJourneyManagement();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto text-purple-400 animate-pulse mb-4" />
          <p className="text-gray-600">Carregando suas jornadas...</p>
        </div>
      </div>
    );
  }

  if (journeys.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-purple-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Nenhuma jornada criada ainda
          </h3>
          <p className="text-gray-600">
            Crie sua primeira jornada personalizada usando os filtros avançados e IA
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in_progress': return 'Em Andamento';
      case 'paused': return 'Pausada';
      default: return 'Criada';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-purple-600" />
          Minhas Jornadas ({journeys.length})
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {journeys.map((journey) => (
          <Card key={journey.id} className="bg-white border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-800 mb-2 line-clamp-2">
                    {journey.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(journey.status)}>
                      {getStatusText(journey.status)}
                    </Badge>
                    {journey.is_completed && (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
              
              {journey.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {journey.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progresso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium">
                    {journey.completed_cases}/{journey.total_cases} casos
                  </span>
                </div>
                <Progress 
                  value={journey.progress_percentage} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500 text-center">
                  {journey.progress_percentage}% concluído
                </p>
              </div>

              {/* Informações */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {journey.estimated_duration_minutes}min
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {journey.objectives?.length || 0} objetivos
                </div>
              </div>

              {/* Objetivos */}
              {journey.objectives && journey.objectives.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Objetivos:</p>
                  <div className="flex flex-wrap gap-1">
                    {journey.objectives.slice(0, 2).map((objective, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-purple-200 text-purple-700">
                        {objective.length > 20 ? `${objective.substring(0, 20)}...` : objective}
                      </Badge>
                    ))}
                    {journey.objectives.length > 2 && (
                      <Badge variant="outline" className="text-xs border-gray-200 text-gray-500">
                        +{journey.objectives.length - 2} mais
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={() => onStartJourney(journey)}
                  size="sm"
                  className={`flex-1 ${
                    journey.is_completed 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                  }`}
                >
                  {journey.is_completed ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Revisar
                    </>
                  ) : journey.status === 'in_progress' ? (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Continuar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Iniciar
                    </>
                  )}
                </Button>

                {onEditJourney && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditJourney(journey)}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteJourney.mutate(journey.id)}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  disabled={deleteJourney.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
