
import React from "react";
import { Button } from "@/components/ui/button";

export function CaseProfileFormActions({
  onPreview, onSuggestTitle, onAutoFill, onGenerateAutoTitle, showPreview
}: any) {
  return (
    <div className="mb-3 flex gap-2">
      <Button type="button" onClick={onPreview} variant="outline">
        Pré-visualizar Caso como Usuário
      </Button>
      <Button type="button" onClick={onSuggestTitle} variant="secondary" className="mb-1">
        Sugerir Diagnóstico
      </Button>
      <Button type="button" onClick={onAutoFill} variant="secondary" className="mb-1">
        Auto-preencher detalhes do caso
      </Button>
      <Button type="button" onClick={onGenerateAutoTitle} variant="secondary" className="mb-1">
        Gerar título automático
      </Button>
    </div>
  );
}
