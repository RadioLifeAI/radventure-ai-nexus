
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MODALITIES_SUBTYPES } from "../utils/modalitiesSubtypes";

type Props = {
  form: any;
  handleFormChange: any;
  handleModalityChange: any;
  highlightedFields: string[];
  renderTooltipTip: any;
};

export function CaseModalityFieldsUnified({ 
  form, 
  handleFormChange, 
  handleModalityChange, 
  highlightedFields, 
  renderTooltipTip 
}: Props) {
  const selectedModality = MODALITIES_SUBTYPES.find(item => item?.modality === form.modality);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className={`${highlightedFields.includes("modality") ? "ring-2 ring-cyan-400 rounded" : ""}`}>
        <label className="font-semibold block">
          Modalidade *
          {renderTooltipTip("tip-modality", "Tipo de exame médico (ex: Radiografia, Tomografia, Ressonância).")}
        </label>
        <Select value={form.modality || ''} onValueChange={handleModalityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a modalidade" />
          </SelectTrigger>
          <SelectContent>
            {MODALITIES_SUBTYPES.map((item) => (
              <SelectItem key={item.modality} value={item.modality}>
                {item.modality}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={`${highlightedFields.includes("subtype") ? "ring-2 ring-cyan-400 rounded" : ""}`}>
        <label className="font-semibold block">
          Subtipo
          {renderTooltipTip("tip-subtype", "Subtipo específico do exame dentro da modalidade selecionada.")}
        </label>
        <Select 
          value={form.subtype || ''} 
          onValueChange={(value) => handleFormChange({ target: { name: 'subtype', value } })}
          disabled={!selectedModality}
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedModality ? "Selecione o subtipo" : "Primeiro selecione uma modalidade"} />
          </SelectTrigger>
          <SelectContent>
            {selectedModality?.subtypes.map((subtype) => (
              <SelectItem key={subtype} value={subtype}>
                {subtype}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
