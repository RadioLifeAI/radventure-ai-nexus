
import React from "react";
import { CasePreviewModalEnhanced } from "./CasePreviewModalEnhanced";
import { useTempCaseImages } from "@/hooks/useTempCaseImages";

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
  const { tempImages } = useTempCaseImages();
  
  if (!open) return null;
  
  // Criar uma versão do form com imagens temporárias para preview
  const formWithTempImages = {
    ...form,
    image_url: tempImages.map(img => img.uploadedUrl || img.tempUrl).filter(Boolean)
  };
  
  return (
    <CasePreviewModalEnhanced
      open={open}
      onClose={onClose}
      formData={formWithTempImages} // Passar form com imagens temporárias
      categories={categories}
      difficulties={difficulties}
    />
  );
}
