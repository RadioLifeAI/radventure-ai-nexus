
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { modalitiesSubtypes } from "../utils/modalitiesSubtypes";

export type ModalityAndSubtypes = {
  value: string;
  label: string;
  subtypes: { value: string; label: string }[];
};

/**
 * Retorna sempre todas as modalidades fixas + subtipos do sistema (padrão da app).
 * Adicionalmente, se houverem subtipos ou modalidades "novos" na base de dados, mescla ambos (sem duplicar).
 */
export function useModalitiesAndSubtypes() {
  const [options, setOptions] = useState<ModalityAndSubtypes[]>(modalitiesSubtypes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      // Busca modalidades e subtipos únicos cadastrados
      const { data, error } = await supabase
        .from("medical_cases")
        .select("modality, subtype")
        .neq("modality", null);

      if (error || !data) {
        setOptions(modalitiesSubtypes);
        setLoading(false);
        return;
      }

      // Index rápido de modalidades/subtipos fixos para merge
      const modalitiesMap: Record<string, Set<string>> = {};
      modalitiesSubtypes.forEach(m => {
        modalitiesMap[m.value] = new Set(m.subtypes.map(sub => sub.value));
      });

      // Adiciona do banco, só se não existir na lista fixa
      data.forEach(({ modality, subtype }) => {
        if (!modality) return;
        if (!modalitiesMap[modality]) {
          modalitiesMap[modality] = new Set();
        }
        if (subtype) {
          modalitiesMap[modality].add(subtype);
        }
      });

      // Transforma para o formato do componente
      const opts: ModalityAndSubtypes[] = Object.entries(modalitiesMap).map(([modality, subSet]) => ({
        value: modality,
        label: modality,
        subtypes: Array.from(subSet).map((sub) => ({ value: sub, label: sub })),
      }));

      // Ordena o array pelo nome da modalidade
      opts.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
      setOptions(opts);
      setLoading(false);
    })();
  }, []);

  return { options, loading };
}
