
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CasePreviewModal } from "./CasePreviewModal";

// Modal leve para preview rápido gamificado, aproveita o CasePreviewModal padrão
export function CaseFormPreviewModal({ 
  open, 
  onClose, 
  form, 
  categories, 
  difficulties 
}: { 
  open: boolean; 
  onClose: () => void; 
  form: any; 
  categories: any[]; 
  difficulties: any[]; 
}) {
  if (!open) return null;
  
  return (
    <CasePreviewModal
      open={open}
      onClose={onClose}
      formData={form}
      categories={categories}
      difficulties={difficulties}
    />
  );
}
