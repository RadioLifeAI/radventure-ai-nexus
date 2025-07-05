import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface EventRankingsDebugProps {
  loadingStates: {
    rankings: boolean;
    stats: boolean;
    hall: boolean;
  };
  dataStates: {
    activeEventRankings: any[];
    personalStats: any;
    hallOfFameData: any[];
  };
}

export function EventRankingsDebug({ loadingStates, dataStates }: EventRankingsDebugProps) {
  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Debug - Estados dos Dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Estados de Loading */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Estados de Loading:</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {loadingStates.rankings ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm">Rankings: {loadingStates.rankings ? 'Carregando' : 'Pronto'}</span>
              </div>
              <div className="flex items-center gap-2">
                {loadingStates.stats ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm">Stats: {loadingStates.stats ? 'Carregando' : 'Pronto'}</span>
              </div>
              <div className="flex items-center gap-2">
                {loadingStates.hall ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm">Hall: {loadingStates.hall ? 'Carregando' : 'Pronto'}</span>
              </div>
            </div>
          </div>

          {/* Estados dos Dados */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Dados Carregados:</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {dataStates.activeEventRankings.length > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Rankings Ativos: {dataStates.activeEventRankings.length}</span>
              </div>
              <div className="flex items-center gap-2">
                {dataStates.personalStats ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Stats Pessoais: {dataStates.personalStats ? 'Disponível' : 'Vazio'}</span>
              </div>
              <div className="flex items-center gap-2">
                {dataStates.hallOfFameData.length > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Hall da Fama: {dataStates.hallOfFameData.length}</span>
              </div>
            </div>
          </div>

          {/* Detalhes dos Dados */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Detalhes:</h4>
            <div className="space-y-1">
              {dataStates.personalStats && (
                <Badge variant="outline" className="text-xs">
                  {dataStates.personalStats.totalParticipations} participações
                </Badge>
              )}
              {dataStates.hallOfFameData.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {dataStates.hallOfFameData.length} campeões
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {dataStates.activeEventRankings.length} rankings ativos
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}