
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import CasoUsuarioView from "@/pages/CasoUsuarioView";

type CaseViewerAdminModalProps = {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
};

/**
 * Modal para visualização do caso como usuário.
 */
export function CaseViewerAdminModal({ open, onClose, caseId }: CaseViewerAdminModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl min-h-[620px]">
        <DialogHeader>
          <DialogTitle>Visualizar caso do ponto de vista do usuário</DialogTitle>
        </DialogHeader>
        {/* Só exibe quando houver um caseId */}
        {caseId && (
          <div className="w-full">
            {/* Reutiliza visualização já existente do usuário */}
            <CasoUsuarioView idProp={caseId} isAdminView />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
