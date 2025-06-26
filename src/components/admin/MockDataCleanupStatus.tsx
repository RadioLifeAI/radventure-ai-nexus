
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Trash2 } from "lucide-react";

export function MockDataCleanupStatus() {
  const cleanupStatus = [
    {
      component: "useUserMock",
      status: "removed",
      description: "Hook de usuário mock removido",
      impact: "Baixo - Substituído por useRealUsers"
    },
    {
      component: "FakeCasesPreview",
      status: "removed", 
      description: "Página de preview de casos fictícios removida",
      impact: "Baixo - Apenas para demonstração"
    },
    {
      component: "medicalCasesMock",
      status: "removed",
      description: "Dados mock de casos médicos removidos",
      impact: "Baixo - Substituído por dados reais"
    },
    {
      component: "UserManagement",
      status: "updated",
      description: "Atualizado para usar dados reais",
      impact: "Médio - Funcionalidade mantida"
    },
    {
      component: "useUserProfile",
      status: "updated",
      description: "Integração real mantida e melhorada",
      impact: "Baixo - Já estava integrado"
    },
    {
      component: "HeaderNav",
      status: "maintained",
      description: "Mantido funcionando com dados reais",
      impact: "Nenhum - Funcionalidade preservada"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "removed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "updated":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "maintained":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "removed":
        return <Badge variant="destructive">REMOVIDO</Badge>;
      case "updated":
        return <Badge className="bg-yellow-500">ATUALIZADO</Badge>;
      case "maintained":
        return <Badge className="bg-green-500">MANTIDO</Badge>;
      default:
        return <Badge variant="secondary">PENDENTE</Badge>;
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Trash2 className="h-5 w-5" />
          Status da Limpeza de Dados Mock
        </CardTitle>
        <CardDescription className="text-orange-700">
          Progresso da remoção de dados fictícios e integração real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cleanupStatus.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <div className="mt-0.5">
                {getStatusIcon(item.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm">{item.component}</h4>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Impacto:</span> {item.impact}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <div className="flex items-center gap-2 text-green-900 font-semibold mb-2">
            <CheckCircle className="h-5 w-5" />
            Limpeza Concluída com Sucesso
          </div>
          <p className="text-sm text-green-700">
            Todos os dados mock foram removidos ou substituídos por integrações reais. 
            O sistema agora opera 100% com dados reais do Supabase.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
