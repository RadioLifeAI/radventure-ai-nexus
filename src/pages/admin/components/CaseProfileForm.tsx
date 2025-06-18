
import React from "react";
import { CaseProfileFormEditable } from "./CaseProfileFormEditable";

export function CaseProfileForm({ 
  editingCase, 
  onCreated 
}: { 
  editingCase?: any; 
  onCreated?: () => void; 
}) {
  return (
    <CaseProfileFormEditable 
      editingCase={editingCase}
      onCreated={onCreated}
    />
  );
}
