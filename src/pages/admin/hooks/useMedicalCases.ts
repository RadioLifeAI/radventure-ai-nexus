
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_CASES } from "../utils/medicalCasesMock";
import { toast } from "@/components/ui/use-toast";

/**
 * Hook para carregar casos médicos e inserir MOCKS se necessário.
 * Agora com sincronização em tempo real.
 */
export function useMedicalCases() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchCases() {
    setLoading(true);
    const { data } = await supabase
      .from("medical_cases")
      .select("id, title, created_at, image_url")
      .order("created_at", { ascending: false });
    setCases(data || []);
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

    maybeInsertMockCases().then(fetchCases);

    // ==== SUPABASE REALTIME ====
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_cases' }, () => {
        // Refaz a busca dos casos sempre que houver alteração!
        fetchCases();
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  async function refreshCases() {
    await fetchCases();
  }

  // Função para deletar caso
  const deleteCase = useCallback(async (id: string) => {
    const { error } = await supabase.from("medical_cases").delete().eq("id", id);
    if (!error) {
      toast({ title: "Caso excluído com sucesso." });
    } else {
      toast({ title: "Erro ao excluir caso!", variant: "destructive" });
    }
  }, []);

  // Função para editar caso (por hora só imprime no console)
  const editCase = useCallback((id: string) => {
    console.log("Editar caso:", id);
    toast({ title: "Em breve: modal de edição do caso." }); // Placeholder
  }, []);

  return { cases, loading, refreshCases, deleteCase, editCase };
}
