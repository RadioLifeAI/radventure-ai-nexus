
import React from "react";
import { CaseProfileExplanationSection } from "./CaseProfileExplanationSection";

interface Props {
  form: any;
  setForm: (form: any) => void;
  handlers: any;
  highlightedFields: string[];
  renderTooltipTip: (id: string, text: string) => React.ReactNode;
}

export function CaseProfileExplanationSectionContainer({
  form,
  setForm,
  handlers,
  highlightedFields,
  renderTooltipTip
}: Props) {
  const { handleFormChange, handleSuggestExplanation, handleSuggestHint } = handlers;

  return (
    <CaseProfileExplanationSection
      form={form}
      highlightedFields={highlightedFields}
      handleFormChange={handleFormChange}
      handleSuggestExplanation={handleSuggestExplanation}
      renderTooltipTip={renderTooltipTip}
      handleSuggestHint={handleSuggestHint}
    />
  );
}
