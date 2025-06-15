
import React from "react";

type Props = {
  autoTitlePreview: string;
  showPreview: boolean;
};

export function CaseProfileFormTitleSection({
  autoTitlePreview,
  showPreview
}: Props) {
  return (
    <div className="mb-3">
      <div className="text-xs text-gray-600">
        Pré-visualização do título: <span className="font-semibold">{autoTitlePreview}</span>
      </div>
    </div>
  );
}
