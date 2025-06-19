
import React from "react";
import { useUnifiedFormDataSource } from "@/hooks/useUnifiedFormDataSource";

type Props = {
  value: { modality: string; subtype: string };
  onChange: (val: { modality: string; subtype: string }) => void;
};

export function CaseModalityFieldsUnified({ value, onChange }: Props) {
  const { modalities, isLoading } = useUnifiedFormDataSource();
  
  const currentModality = modalities.find(m => m.name === value.modality);
  
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold block">Modalidade Principal *</label>
          <div className="w-full border rounded px-2 py-2 text-gray-500">
            Carregando modalidades...
          </div>
        </div>
        <div>
          <label className="font-semibold block">Subtipo *</label>
          <div className="w-full border rounded px-2 py-2 text-gray-500">
            Carregando subtipos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="font-semibold block">Modalidade Principal *</label>
        <select
          className="w-full border rounded px-2 py-2"
          value={value.modality}
          onChange={e => onChange({ modality: e.target.value, subtype: "" })}
          required
        >
          <option value="">Selecione a modalidade</option>
          {modalities.map((m) => (
            <option key={m.id} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-semibold block">Subtipo *</label>
        <select
          className="w-full border rounded px-2 py-2"
          value={value.subtype}
          onChange={e => onChange({ modality: value.modality, subtype: e.target.value })}
          required={!!value.modality}
          disabled={!value.modality}
        >
          <option value="">Selecione o subtipo</option>
          {currentModality?.subtypes.map(sub => (
            <option key={sub.id} value={sub.name}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
