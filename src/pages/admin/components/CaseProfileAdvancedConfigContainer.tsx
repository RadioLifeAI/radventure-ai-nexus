
import React from "react";
import { CaseProfileAdvancedConfig } from "./CaseProfileAdvancedConfig";

type Props = {
  form: any;
  handleFormChange: any;
  handleSuggestHint: any;
  showAdvanced: boolean;
};

export function CaseProfileAdvancedConfigContainer({
  form,
  handleFormChange,
  handleSuggestHint,
  showAdvanced,
}: Props) {
  if (!showAdvanced) return null;
  return (
    <CaseProfileAdvancedConfig
      form={form}
      handleFormChange={handleFormChange}
      handleSuggestHint={handleSuggestHint}
    />
  );
}
