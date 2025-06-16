
import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useModalitiesAndSubtypes } from "../hooks/useModalitiesAndSubtypes";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

type Option = { value: string; label: string };

type CaseFilters = {
  category?: string[];
  difficulty?: string[];
  modality?: string[];
  subtype?: string[];
};

export type CaseFiltersSelectorProps = {
  value: CaseFilters;
  onChange: (newFilters: CaseFilters) => void;
};

export function CaseFiltersSelector({ value, onChange }: CaseFiltersSelectorProps) {
  const [specialties, setSpecialties] = useState<Option[]>([]);
  const [difficulties, setDifficulties] = useState<Option[]>([]);
  const { options: modalitiesOptions, loading: modalitiesLoading } = useModalitiesAndSubtypes();

  useEffect(() => {
    async function fetchOptions() {
      // Especialidades médicas
      const { data: catData } = await supabase.from("medical_specialties").select("name").order("name");
      setSpecialties(
        (catData || [])
          .filter((c: any) => c.name && c.name.trim() !== "") // Filter out empty names
          .map((c: any) => ({ value: c.name, label: c.name }))
      );
      
      // Dificuldades
      const { data: diffData } = await supabase.from("difficulties").select("level, description").order("level");
      setDifficulties(
        (diffData || [])
          .filter((d: any) => d.level && d.description && d.description.trim() !== "") // Filter out empty values
          .map((d: any) => ({ value: `${d.level}`, label: d.description }))
      );
    }
    fetchOptions();
  }, []);

  function handleCheck(type: keyof CaseFilters, val: string, checked: boolean) {
    // Ensure we don't add empty values
    if (!val || val.trim() === "") return;
    
    const old = value[type] || [];
    onChange({
      ...value,
      [type]: checked
        ? [...old, val]
        : old.filter((v: string) => v !== val),
      // Limpando subtipo se modalidade for alterada!
      ...(type === "modality" ? { subtype: [] } : {})
    });
  }

  function handleSubtypeCheck(subVal: string, checked: boolean) {
    // Ensure we don't add empty values
    if (!subVal || subVal.trim() === "") return;
    
    const old = value.subtype || [];
    onChange({
      ...value,
      subtype: checked
        ? [...old, subVal]
        : old.filter((v: string) => v !== subVal),
    });
  }

  function handleClear() {
    onChange({});
  }

  const selectedModalities = value.modality || [];
  // Agrupa subtipos das modalidades selecionadas
  const subtypesPerModality = modalitiesOptions
    .filter((m) => selectedModalities.includes(m.value))
    .map((m) => ({
      modality: m.label,
      subtypes: m.subtypes.filter((s) => s.value && s.value.trim() !== ""), // Filter out empty subtypes
    }))
    .filter(m => m.subtypes.length > 0);

  return (
    <div className="rounded-xl border p-6 bg-white mb-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
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
      <Accordion type="multiple" className="w-full space-y-2" defaultValue={["cat", "dif", "mod"]}>
        {/* Categoria */}
        <AccordionItem value="cat">
          <AccordionTrigger className="font-bold text-base">Categorias / Especialidades</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-auto pr-2">
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
          </AccordionContent>
        </AccordionItem>

        {/* Dificuldade */}
        <AccordionItem value="dif">
          <AccordionTrigger className="font-bold text-base">Dificuldade</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-3">
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
          </AccordionContent>
        </AccordionItem>

        {/* Modalidade de Imagem */}
        <AccordionItem value="mod">
          <AccordionTrigger className="font-bold text-base">Modalidades de Imagem</AccordionTrigger>
          <AccordionContent>
            {modalitiesLoading ? (
              <div className="text-sm text-gray-500 p-2">Carregando modalidades...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-auto pr-2">
                {modalitiesOptions
                  .filter((opt) => opt.value && opt.value.trim() !== "") // Filter out empty values
                  .map((opt) => (
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
            )}
          </AccordionContent>
        </AccordionItem>
        {/* Subtipos em cascata */}
        {selectedModalities.length > 0 && subtypesPerModality.length > 0 && (
          <AccordionItem value="subs">
            <AccordionTrigger className="font-bold text-base">Subtipos por Modalidade</AccordionTrigger>
            <AccordionContent>
              {subtypesPerModality.map(({ modality, subtypes }) => (
                <div key={modality} className="mb-3">
                  <div className="font-semibold mb-1 text-gray-700">{modality}</div>
                  <div className="flex flex-wrap gap-2">
                    {subtypes.map((sub) => (
                      <label key={sub.value} className="flex items-center gap-2 font-normal">
                        <Checkbox
                          checked={!!value.subtype?.includes(sub.value)}
                          onCheckedChange={checked => handleSubtypeCheck(sub.value, Boolean(checked))}
                        />
                        {sub.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
