
import React from "react";
import { CaseProfileFormWithWizard } from "./CaseProfileFormWithWizard";

interface CaseProfileFormProps {
  editingCase?: any;
  onCreated?: () => void;
}

export function CaseProfileForm({ editingCase, onCreated }: CaseProfileFormProps) {
  return (
    <CaseProfileFormWithWizard 
      editingCase={editingCase}
      onCreated={onCreated}
    />
  );
}
