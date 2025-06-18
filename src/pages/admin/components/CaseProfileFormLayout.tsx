
import React from "react";

type Props = {
  form: any;
  highlightedFields: string[];
  showAdvanced: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onModalityChange: (val: { modality: string; subtype: string }) => void;
  onOptionChange: (idx: number, val: string) => void;
  onOptionFeedbackChange: (idx: number, val: string) => void;
  onShortTipChange: (idx: number, val: string) => void;
  onCorrectChange: (idx: number) => void;
  onImageChange: (imagesArr: { url: string; legend: string }[]) => void;
  onToggleAdvanced: () => void;
};

export function CaseProfileFormLayout({
  form,
  highlightedFields,
  showAdvanced,
  onFormChange,
  onModalityChange,
  onOptionChange,
  onOptionFeedbackChange,
  onShortTipChange,
  onCorrectChange,
  onImageChange,
  onToggleAdvanced
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto space-y-5">
      {/* TODO: Implementar os campos do formulário aqui */}
      <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        <p>Layout do formulário será implementado aqui</p>
        <p className="text-sm mt-2">
          Campos destacados: {highlightedFields.join(', ') || 'nenhum'}
        </p>
      </div>
    </div>
  );
}
