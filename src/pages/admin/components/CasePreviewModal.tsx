
import React from "react";
import { CasePreviewModalEnhanced } from "./CasePreviewModalEnhanced";

interface CasePreviewModalProps {
  open: boolean;
  onClose: () => void;
  caseId?: string | null;
  formData?: any;
  categories?: any[];
  difficulties?: any[];
}

// Wrapper para manter compatibilidade com código existente
export function CasePreviewModal(props: CasePreviewModalProps) {
  return <CasePreviewModalEnhanced {...props} />;
}
