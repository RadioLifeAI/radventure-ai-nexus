
import React from "react";
import { CaseProfileAdvancedConfig } from "./CaseProfileAdvancedConfig";

interface Props {
  form: any;
  setForm: (form: any) => void;
  handlers: any;
  highlightedFields: string[];
  renderTooltipTip: (id: string, text: string) => React.ReactNode;
}

export function CaseProfileAdvancedConfigContainer({
  form,
  setForm,
  handlers,
  highlightedFields,
  renderTooltipTip
}: Props) {
  const { handleFormChange, handleSuggestHint } = handlers;

  return (
    <CaseProfileAdvancedConfig
      form={form}
      handleFormChange={handleFormChange}
      handleSuggestHint={handleSuggestHint}
    />
  );
}
