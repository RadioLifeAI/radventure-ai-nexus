
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useMedicalCases() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("medical_cases")
        .select(`
          *,
          medical_specialties (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar casos:", error);
      toast({
        title: "Erro ao carregar casos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCase = async (id: string) => {
    try {
      const { error } = await supabase
        .from("medical_cases")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCases(cases => cases.filter(c => c.id !== id));
      toast({
        title: "Caso deletado com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao deletar caso:", error);
      toast({
        title: "Erro ao deletar caso",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Refetch function to refresh the list
  const refetch = () => {
    fetchCases();
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return {
    cases,
    loading,
    deleteCase,
    refetch
  };
}
