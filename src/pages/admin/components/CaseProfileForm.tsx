
import React, { useState, useEffect } from "react";
import { CaseProfileFormWithWizard } from "./CaseProfileFormWithWizard";
import { CaseProfileFormEditable } from "./CaseProfileFormEditable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  FileText, 
  Zap,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

export function CaseProfileForm({ 
  editingCase, 
  onCreated 
}: { 
  editingCase?: any; 
  onCreated?: () => void; 
}) {
  const [useWizardMode, setUseWizardMode] = useState(!editingCase); // Wizard para criação, Form para edição

  // Se está editando, usar sempre o formulário tradicional
  if (editingCase) {
    return (
      <CaseProfileFormEditable 
        editingCase={editingCase}
        onCreated={onCreated}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Toggle entre Wizard e Formulário Tradicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Modo de Criação
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={useWizardMode ? "default" : "outline"}
                size="sm"
                onClick={() => setUseWizardMode(true)}
                className={useWizardMode ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <Zap className="h-4 w-4 mr-2" />
                Wizard Inteligente
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 text-xs">
                  RECOMENDADO
                </Badge>
              </Button>
              <Button
                variant={!useWizardMode ? "default" : "outline"}
                size="sm"
                onClick={() => setUseWizardMode(false)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Formulário Completo
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            {useWizardMode ? (
              <div className="flex items-center gap-2">
                <ToggleRight className="h-4 w-4 text-green-600" />
                <span>
                  <strong>Wizard Ativo:</strong> Processo guiado em 9 etapas com validação inteligente e AI integrada. 
                  Ideal para novos usuários ou criação rápida.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ToggleLeft className="h-4 w-4 text-blue-600" />
                <span>
                  <strong>Formulário Completo:</strong> Acesso direto a todos os campos em uma única tela. 
                  Ideal para usuários experientes.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Renderizar o modo selecionado */}
      {useWizardMode ? (
        <CaseProfileFormWithWizard onCreated={onCreated} />
      ) : (
        <CaseProfileFormEditable onCreated={onCreated} />
      )}
    </div>
  );
}
