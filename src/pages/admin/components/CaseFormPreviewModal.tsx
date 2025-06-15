
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CasePreviewModal } from "./CasePreviewModal";

// Modal leve para preview rápido gamificado, aproveita o CasePreviewModal padrão
export function CaseFormPreviewModal({ open, onClose, form, categories, difficulties }: any) {
  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-2 max-w-3xl">
        <CasePreviewModal
          open={open}
          onClose={onClose}
          form={form}
          categories={categories}
          difficulties={difficulties}
        />
      </DialogContent>
    </Dialog>
  );
}
