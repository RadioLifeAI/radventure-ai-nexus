
import React from "react";
import { CasePreviewModalEnhanced } from "./CasePreviewModalEnhanced";

interface Props {
  open: boolean;
  onClose: () => void;
  form: any;
  categories: any[];
  difficulties: any[];
  tempImages?: File[];
  specializedImages?: any[];
}

export function CaseFormPreviewModal({ 
  open, 
  onClose, 
  form, 
  categories, 
  difficulties,
  tempImages = [],
  specializedImages = []
}: Props) {
  if (!open) return null;
  
  return (
    <CasePreviewModalEnhanced
      open={open}
      onClose={onClose}
      formData={form}
      categories={categories}
      difficulties={difficulties}
    />
  );
}
