
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ModalityAndSubtypes = {
  value: string;
  label: string;
  subtypes: { value: string; label: string }[];
};

/**
 * Busca todas as modalidades e subtipos existentes na tabela medical_cases.
 * Retorna [{ value, label, subtypes: [{value, label}] }]
 */
export function useModalitiesAndSubtypes() {
  const [options, setOptions] = useState<ModalityAndSubtypes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      // Busca modalidades e subtipos existentes (unicas) no banco.
      const { data, error } = await supabase
        .from("medical_cases")
        .select("modality, subtype")
        .neq("modality", null);

      if (error) {
        setOptions([]);
        setLoading(false);
        return;
      }

      // Mapeia modalidades com seus subtipos (mantendo unicidade)
      const byModality: Record<string, Set<string>> = {};
      (data || []).forEach((item) => {
        if (!item.modality) return;
        if (!byModality[item.modality]) byModality[item.modality] = new Set();
        if (item.subtype) byModality[item.modality].add(item.subtype);
      });

      const opts: ModalityAndSubtypes[] = Object.entries(byModality).map(([modality, subtypesSet]) => ({
        value: modality,
        label: modality,
        subtypes: Array.from(subtypesSet).map((sub) => ({ value: sub, label: sub })),
      }));

      // Ordenar por nome da modalidade
      opts.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
      setOptions(opts);
      setLoading(false);
    })();
  }, []);

  return { options, loading };
}
