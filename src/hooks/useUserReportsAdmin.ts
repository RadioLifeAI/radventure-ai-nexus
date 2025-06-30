
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
      
      // First, get all reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("user_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (reportsError) {
        console.error("Erro ao carregar reports:", reportsError);
        throw reportsError;
      }

      if (!reportsData || reportsData.length === 0) {
        console.log("Nenhum report encontrado");
        return [];
      }

      // Get unique user IDs and case IDs
      const userIds = [...new Set(reportsData.map(r => r.user_id).filter(Boolean))];
      const caseIds = [...new Set(reportsData.map(r => r.case_id).filter(Boolean))];

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      // Fetch medical cases
      const { data: cases } = await supabase
        .from("medical_cases")
        .select("id, title")
        .in("id", caseIds);

      // Create lookup maps
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const casesMap = new Map(cases?.map(c => [c.id, c]) || []);
      
      // Combine the data
      const normalizedReports = reportsData.map(report => {
        const profile = profilesMap.get(report.user_id);
        const case_data = casesMap.get(report.case_id);
        
        return {
          ...report,
          user_email: profile?.email,
          user_name: profile?.full_name,
          case_title: case_data?.title
        };
      });
      
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
