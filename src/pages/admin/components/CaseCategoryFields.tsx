
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";

type Category = { id: number|string, name: string }
type Modality = { id: number|string, name: string }
type Subtype = { id: number|string, name: string }

type Props = {
  categories: Category[];
  modalities: Modality[];
  subtypes: Subtype[];
  selectedModality: number|null;
  form: any;
  handleFormChange: (e: React.ChangeEvent<any>) => void;
};

export function CaseCategoryFields({
  categories,
  modalities,
  subtypes,
  selectedModality,
  form,
  handleFormChange,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="font-semibold">Categoria *</label>
        <select className="w-full border rounded px-2 py-2"
          name="category_id" value={form.category_id} onChange={handleFormChange} required>
          <option value="">Selecione a categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-semibold">Modalidade de Imagem *</label>
        <select className="w-full border rounded px-2 py-2"
          name="main_modality_id" value={form.main_modality_id} onChange={handleFormChange} required>
          <option value="">Selecione a modalidade</option>
          {modalities.map((mod) => (
            <option key={mod.id} value={mod.id}>{mod.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-semibold">Subtipo</label>
        <select className="w-full border rounded px-2 py-2"
          name="subtype_id" value={form.subtype_id} onChange={handleFormChange} disabled={!selectedModality}>
          <option value="">Selecione o subtipo</option>
          {subtypes.map((sub) => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
