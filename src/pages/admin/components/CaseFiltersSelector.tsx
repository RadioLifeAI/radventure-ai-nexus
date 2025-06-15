
import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Option = { value: string; label: string };

type CaseFilters = {
  category?: string[];
  difficulty?: string[];
  modality?: string[];
};

export type CaseFiltersSelectorProps = {
  value: CaseFilters;
  onChange: (newFilters: CaseFilters) => void;
};

export function CaseFiltersSelector({ value, onChange }: CaseFiltersSelectorProps) {
  const [specialties, setSpecialties] = useState<Option[]>([]);
  const [difficulties, setDifficulties] = useState<Option[]>([]);
  const [modalities, setModalities] = useState<Option[]>([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      // Especialidades médicas
      const { data: catData } = await supabase.from("medical_specialties").select("name").order("name");
      setSpecialties(
        (catData || []).map((c: any) => ({ value: c.name, label: c.name }))
      );
      // Dificuldades
      const { data: diffData } = await supabase.from("difficulties").select("level, description").order("level");
      setDifficulties(
        (diffData || []).map((d: any) => ({ value: `${d.level}`, label: d.description }))
      );
      // Modalidades
      const { data: modData } = await supabase.from("imaging_modalities").select("name").order("name");
      setModalities(
        (modData || []).map((m: any) => ({ value: m.name, label: m.name }))
      );
    }
    fetchOptions();
  }, []);

  function handleCheck(type: keyof CaseFilters, val: string, checked: boolean) {
    const old = value[type] || [];
    onChange({
      ...value,
      [type]: checked
        ? [...old, val]
        : old.filter((v: string) => v !== val),
    });
  }

  function handleClear() {
    onChange({});
  }

  return (
    <div className="rounded-xl border p-6 bg-white mb-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-lg font-semibold">
          <Filter className="opacity-80" /> Filtros de Casos
        </span>
        <button
          type="button"
          className="border px-3 py-1 rounded text-sm hover:bg-gray-100"
          onClick={handleClear}
        >
          Limpar Filtros
        </button>
      </div>

      {/* Categoria */}
      <div>
        <div className="font-bold mb-1">Categoria</div>
        <div className="grid grid-cols-3 gap-2">
          {specialties.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 font-normal">
              <Checkbox
                checked={!!value.category?.includes(opt.value)}
                onCheckedChange={checked =>
                  handleCheck("category", opt.value, Boolean(checked))
                }
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Dificuldade */}
      <div>
        <div className="font-bold mb-1">Dificuldade</div>
        <div className="flex gap-4">
          {difficulties.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 font-normal">
              <Checkbox
                checked={!!value.difficulty?.includes(opt.value)}
                onCheckedChange={checked =>
                  handleCheck("difficulty", opt.value, Boolean(checked))
                }
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Modalidade Principal */}
      <div>
        <div className="font-bold mb-1">Modalidade Principal</div>
        <div className="grid grid-cols-3 gap-2">
          {modalities.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 font-normal">
              <Checkbox
                checked={!!value.modality?.includes(opt.value)}
                onCheckedChange={checked =>
                  handleCheck("modality", opt.value, Boolean(checked))
                }
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
