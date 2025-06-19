
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { modalitiesSubtypes } from "../utils/modalitiesSubtypes";

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
  const selectedModality = modalitiesSubtypes.find(item => item?.value === form.modality);

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
            {modalitiesSubtypes.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
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
              <SelectItem key={subtype.value} value={subtype.value}>
                {subtype.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
