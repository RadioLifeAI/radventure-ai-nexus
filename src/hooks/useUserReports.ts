
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface UserReport {
  id: string;
  user_id: string;
  case_id?: string;
  report_type: 'error' | 'content' | 'technical' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'dismissed';
  admin_response?: string;
  admin_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export function useUserReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserReports();
    }
  }, [user]);

  const fetchUserReports = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Erro ao buscar reports:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData: {
    case_id?: string;
    report_type: 'error' | 'content' | 'technical' | 'other';
    title: string;
    description: string;
    metadata?: any;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_reports')
        .insert([{
          user_id: user.id,
          ...reportData
        }])
        .select()
        .single();

      if (error) throw error;

      setReports(prev => [data, ...prev]);
      
      toast({
        title: "Report enviado!",
        description: "Obrigado pelo feedback. Nossa equipe irá analisar em breve.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar report:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o report",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    reports,
    loading,
    createReport,
    refreshReports: fetchUserReports
  };
}
