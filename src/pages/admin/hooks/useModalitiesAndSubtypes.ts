
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ModalityAndSubtypes = {
  value: string;
  label: string;
  subtypes: { value: string; label: string }[];
};

/**
 * Hook que busca modalidades e subtipos diretamente do banco de dados.
 * Agora com dados atualizados e unificados após correção das especialidades.
 */
export function useModalitiesAndSubtypes() {
  const [options, setOptions] = useState<ModalityAndSubtypes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModalitiesAndSubtypes = async () => {
      try {
        setLoading(true);
        
        // Buscar modalidades principais (agora com dados atualizados)
        const { data: modalities, error: modalitiesError } = await supabase
          .from("imaging_modalities")
          .select("name")
          .order("name");

        if (modalitiesError) {
          console.error("Erro ao buscar modalidades:", modalitiesError);
          throw modalitiesError;
        }

        // Buscar subtipos (agora com dados atualizados)
        const { data: subtypes, error: subtypesError } = await supabase
          .from("imaging_subtypes")
          .select("name, modality_name")
          .order("name");

        if (subtypesError) {
          console.error("Erro ao buscar subtipos:", subtypesError);
          throw subtypesError;
        }

        // Organizar dados no formato esperado
        const modalitiesMap: Record<string, ModalityAndSubtypes> = {};

        // Inicializar modalidades com dados atualizados
        modalities?.forEach(modality => {
          modalitiesMap[modality.name] = {
            value: modality.name,
            label: modality.name,
            subtypes: []
          };
        });

        // Adicionar subtipos às modalidades correspondentes (dados atualizados)
        subtypes?.forEach(subtype => {
          if (modalitiesMap[subtype.modality_name]) {
            modalitiesMap[subtype.modality_name].subtypes.push({
              value: subtype.name,
              label: subtype.name
            });
          }
        });

        // Converter para array e ordenar (português brasileiro)
        const result = Object.values(modalitiesMap).sort((a, b) => 
          a.label.localeCompare(b.label, "pt-BR")
        );

        console.log(`[useModalitiesAndSubtypes] Carregadas ${result.length} modalidades com dados unificados`);
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
