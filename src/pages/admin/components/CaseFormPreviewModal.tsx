
import React from "react";
import { Modal } from "@/components/ui/dialog";
import { CasePreviewModal } from "./CasePreviewModal";

// Modal leve para preview rápido gamificado, aproveita o CasePreviewModal padrão
export function CaseFormPreviewModal({ open, onClose, form, categories, difficulties }: any) {
  if (!open) return null;
  return (
    <Modal open={open} onOpenChange={onClose}>
      <div className="p-2">
        <CasePreviewModal form={form} categories={categories} difficulties={difficulties} />
      </div>
    </Modal>
  );
}
