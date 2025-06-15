import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_CASES } from "../utils/medicalCasesMock";
import { toast } from "@/components/ui/use-toast";

/**
 * Hook para carregar casos médicos e inserir MOCKS se necessário.
 * Agora com sincronização em tempo real e filtros.
 */
export function useMedicalCases({ categoryFilter = "", modalityFilter = "" } = {}) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchCases() {
    setLoading(true);
    let query = supabase
      .from("medical_cases")
      .select("id, title, created_at, image_url, specialty, modality")
      .order("created_at", { ascending: false });
    // Filtros
    if (categoryFilter) query = query.eq("specialty", categoryFilter);
    if (modalityFilter) query = query.eq("modality", modalityFilter);

    const { data, error } = await query;
    if (error) {
      toast({ title: "Erro ao buscar casos!", variant: "destructive" });
      setCases([]);
    } else {
      setCases(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function maybeInsertMockCases() {
      const { data: existing } = await supabase
        .from("medical_cases")
        .select("id")
        .eq("title", MOCK_CASES[0].title);
      if (!existing || existing.length === 0) {
        await supabase.from("medical_cases").insert(
          MOCK_CASES.map(c => ({
            ...c,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        );
      }
    }

    //maybeInsertMockCases().then(fetchCases);

    fetchCases();

    // ==== SUPABASE REALTIME ====
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_cases' }, () => {
        fetchCases();
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [categoryFilter, modalityFilter]); // refaz busca ao mudar filtro

  async function refreshCases() {
    await fetchCases();
  }

  // Função para deletar caso (corrigida)
  const deleteCase = useCallback(
    async (id: string) => {
      const { error, data } = await supabase.from("medical_cases").delete().eq("id", id);
      console.log("[deleteCase] id:", id, "error:", error, "data:", data);
      if (!error) {
        toast({ title: "Caso excluído com sucesso." });
        await refreshCases(); // Força atualização dos casos!
      } else {
        toast({ title: "Erro ao excluir caso!", variant: "destructive" });
        console.error("[deleteCase] Erro ao excluir caso:", error);
      }
    },
    [refreshCases]
  );

  // Função para editar caso (por hora só imprime no console)
  const editCase = useCallback((id: string) => {
    console.log("Editar caso:", id);
    toast({ title: "Em breve: modal de edição do caso." });
  }, []);

  return { cases, loading, refreshCases, deleteCase, editCase };
}
