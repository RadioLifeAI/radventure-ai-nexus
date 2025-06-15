
// Wrapper do formulário: importa o core real.
import React from "react";
import { CaseProfileFormCore } from "./CaseProfileFormCore";

export function CaseProfileForm(props: { onCreated?: () => void }) {
  return <CaseProfileFormCore {...props} />;
}

// Para não quebrar import padrão (default)
export default CaseProfileForm;
