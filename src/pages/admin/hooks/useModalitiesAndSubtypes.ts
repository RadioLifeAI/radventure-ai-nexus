
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ModalityAndSubtypes = {
  value: string;
  label: string;
  subtypes: { value: string; label: string }[];
};

/**
 * Hook que busca modalidades e subtipos diretamente do banco de dados.
 * Substitui o arquivo modalitiesSubtypes.ts para garantir consistência.
 */
export function useModalitiesAndSubtypes() {
  const [options, setOptions] = useState<ModalityAndSubtypes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModalitiesAndSubtypes = async () => {
      try {
        setLoading(true);
        
        // Buscar modalidades principais
        const { data: modalities, error: modalitiesError } = await supabase
          .from("imaging_modalities")
          .select("name")
          .order("name");

        if (modalitiesError) throw modalitiesError;

        // Buscar subtipos
        const { data: subtypes, error: subtypesError } = await supabase
          .from("imaging_subtypes")
          .select("name, modality_name")
          .order("name");

        if (subtypesError) throw subtypesError;

        // Organizar dados no formato esperado
        const modalitiesMap: Record<string, ModalityAndSubtypes> = {};

        // Inicializar modalidades
        modalities?.forEach(modality => {
          modalitiesMap[modality.name] = {
            value: modality.name,
            label: modality.name,
            subtypes: []
          };
        });

        // Adicionar subtipos às modalidades correspondentes
        subtypes?.forEach(subtype => {
          if (modalitiesMap[subtype.modality_name]) {
            modalitiesMap[subtype.modality_name].subtypes.push({
              value: subtype.name,
              label: subtype.name
            });
          }
        });

        // Converter para array e ordenar
        const result = Object.values(modalitiesMap).sort((a, b) => 
          a.label.localeCompare(b.label, "pt-BR")
        );

        setOptions(result);
      } catch (error) {
        console.error("Erro ao buscar modalidades e subtipos:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModalitiesAndSubtypes();
  }, []);

  return { options, loading };
}
