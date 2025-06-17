
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

// Modal único e principal para preview de casos
export function CasePreviewModal(props: CasePreviewModalProps) {
  return <CasePreviewModalEnhanced {...props} />;
}

// Export padrão para compatibilidade
export default CasePreviewModal;

// Exports adicionais para manter compatibilidade
export { CasePreviewModal as CaseFormPreviewModal };
export { CasePreviewModal as CaseProfileFormPreviewModal };
