
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SystemStatus {
  total_users: number;
  total_admins: number;
  total_cases: number;
  active_events: number;
  system_health: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  last_cleanup: string;
  timestamp: string;
}

export function useSystemStatus() {
  const { data: status, isLoading, error, refetch } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      console.log('Fetching system status...');
      
      const { data, error } = await supabase.rpc('get_system_status');
      
      if (error) {
        console.error('Error fetching system status:', error);
        throw error;
      }
      
      console.log('System status fetched:', data);
      return data as SystemStatus;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const runCleanup = async () => {
    try {
      console.log('Running system cleanup...');
      
      const { error } = await supabase.rpc('system_cleanup_maintenance');
      
      if (error) {
        console.error('Error running cleanup:', error);
        throw error;
      }
      
      console.log('System cleanup completed successfully');
      refetch();
      
      return { success: true };
    } catch (error: any) {
      console.error('Cleanup failed:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    status,
    isLoading,
    error,
    refetch,
    runCleanup
  };
}
