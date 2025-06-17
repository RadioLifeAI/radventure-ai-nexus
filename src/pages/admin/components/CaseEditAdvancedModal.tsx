
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CaseProfileFormEditable } from "./CaseProfileFormEditable";
import { useMedicalCases } from "../hooks/useMedicalCases";

interface CaseEditAdvancedModalProps {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
  onSaved?: () => void;
}

export function CaseEditAdvancedModal({
  open,
  onClose,
  caseId,
  onSaved
}: CaseEditAdvancedModalProps) {
  const { cases } = useMedicalCases();
  const editingCase = cases.find(c => c.id === caseId);

  const handleCaseSaved = () => {
    onSaved?.();
    onClose();
  };

  if (!editingCase && caseId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">
            Editar Caso Médico
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0">
          <CaseProfileFormEditable
            editingCase={editingCase}
            onCreated={handleCaseSaved}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
