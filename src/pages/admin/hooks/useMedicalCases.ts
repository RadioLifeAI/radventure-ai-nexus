
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_CASES } from "../utils/medicalCasesMock";

/**
 * Hook para carregar casos médicos e inserir MOCKS se necessário.
 */
export function useMedicalCases() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

    maybeInsertMockCases().then(() => {
      supabase.from("medical_cases")
        .select("id, title, created_at, image_url")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (mounted) setCases(data || []);
          setLoading(false);
        });
    });

    return () => { mounted = false };
  }, []);

  async function refreshCases() {
    setLoading(true);
    const { data } = await supabase
      .from("medical_cases")
      .select("id, title, created_at, image_url")
      .order("created_at", { ascending: false });
    setCases(data || []);
    setLoading(false);
  }

  return { cases, loading, refreshCases };
}
