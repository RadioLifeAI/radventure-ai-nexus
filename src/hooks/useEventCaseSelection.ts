import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CaseFilters {
  category?: string[];
  modality?: string[];
  difficulty?: string[];
  subtype?: string[];
}

/**
 * Hook para selecionar e salvar casos específicos para eventos
 * Garante que todos os usuários vejam exatamente os mesmos casos
 */
export function useEventCaseSelection() {
  const [loading, setLoading] = useState(false);

  /**
   * Seleciona casos baseado nos filtros e salva na tabela event_cases
   * @param eventId - ID do evento
   * @param filters - Filtros para seleção de casos
   * @param numberOfCases - Número máximo de casos
   * @returns Array de casos selecionados
   */
  const selectAndSaveCases = async (
    eventId: string,
    filters: CaseFilters,
    numberOfCases: number
  ) => {
    setLoading(true);
    try {
      console.log(`🎯 Selecionando casos para evento ${eventId}:`, {
        filters,
        numberOfCases
      });

      // 1. Buscar casos baseado nos filtros
      let query = supabase.from("medical_cases").select("*");

      if (filters.category && filters.category.length > 0) {
        query = query.in("specialty", filters.category);
      }

      if (filters.modality && filters.modality.length > 0) {
        query = query.in("modality", filters.modality);
      }

      if (filters.difficulty && filters.difficulty.length > 0) {
        query = query.in("difficulty_level", filters.difficulty.map(d => parseInt(d)));
      }

      if (filters.subtype && filters.subtype.length > 0) {
        query = query.in("subtype", filters.subtype);
      }

      const { data: allCases, error: casesError } = await query;
      if (casesError) throw casesError;

      if (!allCases || allCases.length === 0) {
        throw new Error("Nenhum caso encontrado com os filtros especificados");
      }

      // 2. Embaralhar casos usando seed fixo (eventId)
      const shuffledCases = shuffleArray(allCases, eventId);

      // 3. Limitar ao número de casos solicitado
      const selectedCases = shuffledCases.slice(0, numberOfCases);

      if (selectedCases.length < numberOfCases) {
        console.warn(`⚠️ Apenas ${selectedCases.length} casos disponíveis (solicitado: ${numberOfCases})`);
      }

      // 4. Limpar casos existentes do evento (se houver)
      await supabase
        .from("event_cases")
        .delete()
        .eq("event_id", eventId);

      // 5. Salvar casos selecionados na tabela event_cases
      const eventCasesData = selectedCases.map((case_, index) => ({
        event_id: eventId,
        case_id: case_.id,
        sequence: index + 1
      }));

      const { error: insertError } = await supabase
        .from("event_cases")
        .insert(eventCasesData);

      if (insertError) throw insertError;

      console.log(`✅ ${selectedCases.length} casos salvos para evento ${eventId}`);
      
      return selectedCases;

    } catch (error: any) {
      console.error(`❌ Erro ao selecionar casos para evento ${eventId}:`, error);
      toast({
        title: "Erro ao selecionar casos",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Migra eventos existentes para usar sistema de casos pré-selecionados
   * @param eventId - ID do evento a ser migrado
   */
  const migrateExistingEvent = async (eventId: string) => {
    setLoading(true);
    try {
      console.log(`🔄 Migrando evento ${eventId} para sistema de casos pré-selecionados`);

      // 1. Buscar dados do evento
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;

      // 2. Verificar se já tem casos pré-selecionados
      const { data: existingCases } = await supabase
        .from("event_cases")
        .select("id")
        .eq("event_id", eventId)
        .limit(1);

      if (existingCases && existingCases.length > 0) {
        console.log(`ℹ️ Evento ${eventId} já possui casos pré-selecionados`);
        return;
      }

      // 3. Selecionar e salvar casos baseado nos filtros configurados
      if (event.case_filters) {
        await selectAndSaveCases(
          eventId,
          event.case_filters as CaseFilters,
          event.number_of_cases || 10
        );
        
        console.log(`✅ Evento ${eventId} migrado com sucesso`);
      } else {
        console.warn(`⚠️ Evento ${eventId} não possui filtros configurados`);
      }

    } catch (error: any) {
      console.error(`❌ Erro ao migrar evento ${eventId}:`, error);
      toast({
        title: "Erro na migração",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Migra todos os eventos existentes que não possuem casos pré-selecionados
   */
  const migrateAllEvents = async () => {
    setLoading(true);
    try {
      console.log("🔄 Iniciando migração de todos os eventos existentes");

      // 1. Buscar eventos que não possuem casos pré-selecionados
      const { data: eventsWithoutCases, error } = await supabase
        .from("events")
        .select("id, name, case_filters, number_of_cases")
        .not("case_filters", "is", null);

      if (error) throw error;

      if (!eventsWithoutCases || eventsWithoutCases.length === 0) {
        console.log("ℹ️ Nenhum evento encontrado para migração");
        return { migrated: 0, total: 0 };
      }

      let migratedCount = 0;
      const total = eventsWithoutCases.length;

      // 2. Migrar cada evento individualmente
      for (const event of eventsWithoutCases) {
        try {
          // Verificar se já tem casos
          const { data: existingCases } = await supabase
            .from("event_cases")
            .select("id")
            .eq("event_id", event.id)
            .limit(1);

          if (!existingCases || existingCases.length === 0) {
            await selectAndSaveCases(
              event.id,
              event.case_filters as CaseFilters,
              event.number_of_cases || 10
            );
            migratedCount++;
            console.log(`✅ Evento "${event.name}" migrado`);
          }
        } catch (eventError) {
          console.error(`❌ Erro ao migrar evento "${event.name}":`, eventError);
        }
      }

      toast({
        title: "Migração concluída",
        description: `${migratedCount} de ${total} eventos migrados com sucesso`,
        className: "bg-green-50 border-green-200"
      });

      return { migrated: migratedCount, total };

    } catch (error: any) {
      console.error("❌ Erro na migração em lote:", error);
      toast({
        title: "Erro na migração",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    selectAndSaveCases,
    migrateExistingEvent,
    migrateAllEvents,
    loading
  };
}

// Função auxiliar para embaralhar array com seed determinística
function shuffleArray<T>(array: T[], seed: string): T[] {
  const arr = [...array];
  let hash = 0;
  
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Simple seeded random
  const random = () => {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr;
}