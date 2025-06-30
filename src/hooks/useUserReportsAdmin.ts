
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserReport {
  id: string;
  user_id: string;
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
  // Joined data
  user_email?: string;
  user_name?: string;
  case_title?: string;
}

export function useUserReportsAdmin() {
  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-user-reports"],
    queryFn: async () => {
      console.log("Carregando reports dos usuários...");
      
      const { data, error } = await supabase
        .from("user_reports")
        .select(`
          *,
          profiles!user_reports_user_id_fkey(email, full_name),
          medical_cases!user_reports_case_id_fkey(title)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar reports:", error);
        throw error;
      }
      
      // Normalizar dados para facilitar o uso
      const normalizedReports = data?.map(report => ({
        ...report,
        user_email: report.profiles?.email,
        user_name: report.profiles?.full_name,
        case_title: report.medical_cases?.title
      })) || [];
      
      console.log("Reports carregados:", normalizedReports.length);
      return normalizedReports as UserReport[];
    },
  });

  const updateReportStatus = async (reportId: string, status: string, adminResponse?: string) => {
    const { error } = await supabase
      .from("user_reports")
      .update({ 
        status,
        admin_response: adminResponse,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", reportId);

    if (error) throw error;
    refetch();
  };

  // Estatísticas
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    in_progress: reports.filter(r => r.status === 'in_progress').length
  };

  return {
    reports,
    isLoading,
    refetch,
    updateReportStatus,
    stats
  };
}
