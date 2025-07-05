import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface EventCase {
  id: string;
  title: string;
  description: string;
  specialty: string;
  modality: string;
  difficulty_level: number;
  points: number;
  image_url: any[];
  main_question: string;
  answer_options: string[];
  correct_answer_index: number;
  explanation: string;
  answer_feedbacks: string[];
  findings: string;
  patient_clinical_info: string;
}

export function useEventCases(eventId: string) {
  const { user } = useAuth();
  const [cases, setCases] = useState<EventCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId || !user) return;

    const fetchEventCases = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Buscar configuração do evento
        const { data: event, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();

        if (eventError) throw eventError;

        // 2. PRIORIDADE: Verificar se há casos pré-selecionados na tabela event_cases
        const { data: eventCases, error: eventCasesError } = await supabase
          .from("event_cases")
          .select(`
            case_id,
            sequence,
            medical_cases!inner(*)
          `)
          .eq("event_id", eventId)
          .order("sequence", { ascending: true });

        if (eventCasesError) throw eventCasesError;

        let casesToUse: any[] = [];

        if (eventCases && eventCases.length > 0) {
          // ✅ SISTEMA CONSISTENTE: Usar casos pré-selecionados
          casesToUse = eventCases.map(ec => ec.medical_cases);
          console.log(`✅ Usando ${casesToUse.length} casos pré-selecionados para evento ${eventId}`);
        } else {
          // 📋 FALLBACK: Buscar casos baseado nos filtros (compatibilidade)
          console.log(`📋 Fallback: Aplicando filtros dinâmicos para evento ${eventId}`);
          
          let query = supabase
            .from("medical_cases")
            .select("*");

          // Aplicar filtros se existirem
          if (event.case_filters) {
            const filters = event.case_filters as any;

            if (filters.category && filters.category.length > 0) {
              query = query.in("specialty", filters.category);
            }

            if (filters.modality && filters.modality.length > 0) {
              query = query.in("modality", filters.modality);
            }

            if (filters.difficulty && filters.difficulty.length > 0) {
              query = query.in("difficulty_level", filters.difficulty.map(d => parseInt(d)));
            }
          }

          const { data: filteredCases, error: casesError } = await query;
          if (casesError) throw casesError;

          casesToUse = filteredCases || [];

          // 🎯 ORDEM CONSISTENTE: Usar seed fixo baseado no eventId (não user.id)
          casesToUse = shuffleArray(casesToUse, eventId);
          
          // Limitar quantidade se especificado
          if (event.number_of_cases && event.number_of_cases > 0) {
            casesToUse = casesToUse.slice(0, event.number_of_cases);
          }
        }

        // PROTEÇÃO: Filtrar casos undefined ou inválidos
        const validCases = casesToUse.filter((case_, index) => {
          if (!case_) {
            console.warn(`⚠️ Caso ${index} é undefined/null no evento ${eventId}`);
            return false;
          }
          if (!case_.id) {
            console.warn(`⚠️ Caso ${index} não tem ID no evento ${eventId}:`, case_);
            return false;
          }
          return true;
        });

        console.log(`📊 DIAGNÓSTICO EVENTO ${eventId}:`, {
          casosOriginais: casesToUse.length,
          casosValidos: validCases.length,
          casosInvalidos: casesToUse.length - validCases.length,
          usuarioId: user.id
        });

        // Formatar casos para uso na arena
        const formattedCases: EventCase[] = validCases.map(case_ => ({
          id: case_.id,
          title: case_.title || "Caso Médico",
          description: case_.description || "",
          specialty: case_.specialty || "",
          modality: case_.modality || "",
          difficulty_level: case_.difficulty_level || 1,
          points: case_.points || 10,
          image_url: case_.image_url || [],
          main_question: case_.main_question || "",
          answer_options: case_.answer_options || [],
          correct_answer_index: case_.correct_answer_index || 0,
          explanation: case_.explanation || "",
          answer_feedbacks: case_.answer_feedbacks || [],
          findings: case_.findings || "",
          patient_clinical_info: case_.patient_clinical_info || ""
        }));

        setCases(formattedCases);
        
        // Log final de sucesso
        console.log(`✅ Casos carregados com sucesso para evento ${eventId}:`, {
          totalCasos: formattedCases.length,
          primeirosCasos: formattedCases.slice(0, 3).map(c => ({ id: c.id, title: c.title }))
        });
      } catch (err: any) {
        console.error(`❌ ERRO DETALHADO evento ${eventId}:`, {
          erro: err.message,
          stack: err.stack,
          usuarioId: user.id,
          timestamp: new Date().toISOString()
        });
        setError(`Falha ao carregar casos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEventCases();
  }, [eventId, user]);

  return { cases, loading, error, refetch: () => window.location.reload() };
}

// Função para embaralhar array baseado em seed (determinística)
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