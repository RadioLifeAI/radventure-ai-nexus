
import React from "react";
import { CaseProfileExplanationSection } from "./CaseProfileExplanationSection";

type Props = {
  form: any;
  highlightedFields: string[];
  handleFormChange: any;
  handleSuggestExplanation: any;
  renderTooltipTip: any;
  handleSuggestHint: any;
};

export function CaseProfileExplanationSectionContainer({
  form,
  highlightedFields,
  handleFormChange,
  handleSuggestExplanation,
  renderTooltipTip,
  handleSuggestHint
}: Props) {
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
