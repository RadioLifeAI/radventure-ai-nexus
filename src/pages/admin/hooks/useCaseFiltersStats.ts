
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para retornar estatísticas rápidas dos filtros: 
 * total de casos, dificuldade média.
 */
export function useCaseFiltersStats(filters: any) {
  const [stats, setStats] = useState({ count: 0, difficulty: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Quando não há filtro, não faz busca
    if (!filters || Object.keys(filters).length === 0) {
      setStats({ count: 0, difficulty: 0 });
      setLoading(false);
      return;
    }
    setLoading(true);
    // Monta consulta dinâmica nos filtros selecionados
    let query: any = supabase.from("medical_cases").select("id, difficulty_level", { count: "exact", head: false });
    if (filters.category?.length)
      query = query.in("specialty", filters.category);
    if (filters.modality?.length)
      query = query.in("modality", filters.modality);
    if (filters.subtype?.length)
      query = query.in("subtype", filters.subtype);
    if (filters.difficulty?.length)
      query = query.in("difficulty_level", filters.difficulty.map(Number));
    query.then(({ data, count }) => {
      const lvlArr = (data || []).map(row => row.difficulty_level).filter(Boolean);
      const avg = lvlArr.length > 0 ? lvlArr.reduce((a, b) => a + b, 0) / lvlArr.length : 0;
      setStats({
        count: count || 0,
        difficulty: avg
      });
      setLoading(false);
    });
  }, [JSON.stringify(filters)]);

  return { stats, loading };
}
