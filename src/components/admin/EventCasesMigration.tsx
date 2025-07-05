import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useEventCaseSelection } from "@/hooks/useEventCaseSelection";
import { toast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Database,
  Target,
  Users,
  Trophy
} from "lucide-react";

export function EventCasesMigration() {
  const [migrationResult, setMigrationResult] = useState<{
    migrated: number;
    total: number;
  } | null>(null);
  
  const { migrateAllEvents, loading } = useEventCaseSelection();

  const handleMigration = async () => {
    try {
      const result = await migrateAllEvents();
      setMigrationResult(result);
      
      if (result.migrated > 0) {
        toast({
          title: "✅ Migração concluída com sucesso!",
          description: `${result.migrated} eventos agora garantem casos consistentes para todos os usuários.`,
          className: "bg-green-50 border-green-200"
        });
      } else {
        toast({
          title: "ℹ️ Nenhuma migração necessária",
          description: "Todos os eventos já possuem casos pré-selecionados.",
          className: "bg-blue-50 border-blue-200"
        });
      }
    } catch (error) {
      console.error("Erro na migração:", error);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Database className="h-6 w-6 text-blue-600" />
          Sistema de Casos Consistentes para Eventos
        </CardTitle>
        <p className="text-gray-600">
          Garante que todos os usuários vejam exatamente os mesmos casos em cada evento,
          criando competições justas e rankings válidos.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="font-semibold text-blue-800">Casos Consistentes</div>
              <div className="text-sm text-blue-600">Mesmos casos para todos</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="font-semibold text-green-800">Competição Justa</div>
              <div className="text-sm text-green-600">Mesmo desafio para todos</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="font-semibold text-purple-800">Rankings Válidos</div>
              <div className="text-sm text-purple-600">Comparação precisa</div>
            </CardContent>
          </Card>
        </div>

        {/* Explicação do Sistema */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-2">
                Como funciona o Sistema de Casos Consistentes?
              </h4>
              <ul className="text-amber-700 text-sm space-y-1">
                <li>• <strong>Antes:</strong> Cada usuário via casos diferentes baseado no seu histórico</li>
                <li>• <strong>Problema:</strong> Competição injusta - usuários experientes tinham menos casos disponíveis</li>
                <li>• <strong>Agora:</strong> Casos são pré-selecionados na criação do evento usando seed fixo</li>
                <li>• <strong>Resultado:</strong> TODOS os usuários veem exatamente os mesmos casos no mesmo evento</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resultado da Migração */}
        {migrationResult && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 mb-2">
                  Migração Concluída com Sucesso!
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Eventos Migrados:</span>
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      {migrationResult.migrated}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-green-700">Total de Eventos:</span>
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      {migrationResult.total}
                    </Badge>
                  </div>
                </div>
                {migrationResult.migrated > 0 && (
                  <div className="mt-2">
                    <Progress 
                      value={(migrationResult.migrated / migrationResult.total) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-green-600 mt-1">
                      {Math.round((migrationResult.migrated / migrationResult.total) * 100)}% dos eventos migrados
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botão de Migração */}
        <div className="flex justify-center">
          <Button
            onClick={handleMigration}
            disabled={loading}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Executando Migração...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                Migrar Eventos Existentes
              </>
            )}
          </Button>
        </div>

        {/* Informações Técnicas */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-2">
            Detalhes Técnicos
          </h4>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>• Eventos novos já usam automaticamente o sistema consistente</li>
            <li>• Casos são salvos na tabela <code className="bg-gray-200 px-1 rounded">event_cases</code></li>
            <li>• Usa seed baseado no <code className="bg-gray-200 px-1 rounded">event_id</code> para embaralhamento determinístico</li>
            <li>• Mantém compatibilidade com eventos antigos via fallback</li>
            <li>• Zero impacto no desempenho ou experiência do usuário</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}