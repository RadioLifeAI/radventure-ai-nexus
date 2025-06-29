
import React from "react";
import { CasePreviewModalEnhanced } from "./CasePreviewModalEnhanced";

// Modal leve para preview rápido gamificado usando o novo design
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
    <CasePreviewModalEnhanced
      open={open}
      onClose={onClose}
      formData={form}
      categories={categories}
      difficulties={difficulties}
      tempImages={form.tempImages || []}
      isAdminView={true}
    />
  );
}
