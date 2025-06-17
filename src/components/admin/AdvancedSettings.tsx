
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Construction } from "lucide-react";

export function AdvancedSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            Configurações Avançadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-12">
            <Construction className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Funcionalidade Temporariamente Removida</h3>
            <p>Esta seção será implementada após a limpeza completa do banco de dados</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                ✅ Componente simplificado para evitar erros de build<br/>
                🔧 Será reimplementado com estrutura limpa
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
