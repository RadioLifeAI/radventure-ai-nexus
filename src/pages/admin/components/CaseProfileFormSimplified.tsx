
import React from "react";
import { CaseProfileFormEditable } from "./CaseProfileFormEditable";

interface CaseProfileFormSimplifiedProps {
  editingCase?: any;
  onCreated?: () => void;
}

export function CaseProfileFormSimplified({ 
  editingCase, 
  onCreated 
}: CaseProfileFormSimplifiedProps) {
  return (
    <CaseProfileFormEditable 
      editingCase={editingCase}
      onCreated={onCreated}
    />
  );
}
