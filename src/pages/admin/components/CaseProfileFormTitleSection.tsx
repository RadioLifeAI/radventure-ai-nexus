
import React from "react";
import { CaseProfileFormActions } from "./CaseProfileFormActions";

type Props = {
  autoTitlePreview: string;
  onPreview: () => void;
  onSuggestTitle: () => void;
  onAutoFill: () => void;
  onGenerateAutoTitle: () => void;
  showPreview: boolean;
};
export function CaseProfileFormTitleSection({
  autoTitlePreview,
  onPreview,
  onSuggestTitle,
  onAutoFill,
  onGenerateAutoTitle,
  showPreview
}: Props) {
  return (
    <div className="mb-3">
      <CaseProfileFormActions
        onPreview={onPreview}
        onSuggestTitle={onSuggestTitle}
        onAutoFill={onAutoFill}
        onGenerateAutoTitle={onGenerateAutoTitle}
        showPreview={showPreview}
      />
      <div className="text-xs text-gray-600">Pré-visualização do título: <span className="font-semibold">{autoTitlePreview}</span></div>
    </div>
  );
}
