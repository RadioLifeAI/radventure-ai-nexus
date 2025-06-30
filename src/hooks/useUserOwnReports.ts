
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UserOwnReport {
  id: string;
  case_id: string;
  report_type: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  admin_response?: string;
  metadata?: any;
  case_title?: string;
}

export function useUserOwnReports() {
  const { user } = useAuth();
  
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["user-own-reports", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log("Carregando reports do usuário...");
      
      // Buscar reports do usuário
      const { data: reportsData, error } = await supabase
        .from("user_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar reports do usuário:", error);
        throw error;
      }

      if (!reportsData || reportsData.length === 0) {
        return [];
      }

      // Buscar títulos dos casos
      const caseIds = [...new Set(reportsData.map(r => r.case_id).filter(Boolean))];
      const { data: cases } = await supabase
        .from("medical_cases")
        .select("id, title")
        .in("id", caseIds);

      const casesMap = new Map(cases?.map(c => [c.id, c]) || []);
      
      // Combinar dados
      const normalizedReports = reportsData.map(report => ({
        ...report,
        case_title: casesMap.get(report.case_id)?.title
      }));
      
      console.log("Reports do usuário carregados:", normalizedReports.length);
      return normalizedReports as UserOwnReport[];
    },
    enabled: !!user?.id,
  });

  const getReportById = (reportId: string) => {
    return reports.find(report => report.id === reportId);
  };

  return {
    reports,
    isLoading,
    getReportById
  };
}
