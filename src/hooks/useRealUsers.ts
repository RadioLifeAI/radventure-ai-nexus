
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { UserProfile } from "@/types/admin";

export function useRealUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['real-users'],
    queryFn: async () => {
      console.log('Fetching real users from Supabase...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Real users fetched:', data?.length);
      return data as UserProfile[];
    },
    refetchOnWindowFocus: false,
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) => {
      console.log('Updating user:', userId, updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['real-users'] });
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    }
  });

  const promoteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Promoting user to ADMIN:', userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          type: 'ADMIN',
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) throw error;

      // Add admin role
      const { error: roleError } = await supabase
        .from('admin_user_roles')
        .insert({
          user_id: userId,
          admin_role: 'TechAdmin',
          assigned_by: userId,
          is_active: true
        });

      if (roleError) {
        console.warn('Warning: Could not add admin role:', roleError);
      }

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['real-users'] });
      toast.success('Usuário promovido a ADMIN com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error promoting user:', error);
      toast.error(`Erro ao promover usuário: ${error.message}`);
    }
  });

  const demoteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Demoting user to USER:', userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          type: 'USER',
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) throw error;

      // Deactivate admin roles
      const { error: roleError } = await supabase
        .from('admin_user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (roleError) {
        console.warn('Warning: Could not deactivate roles:', roleError);
      }

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['real-users'] });
      toast.success('Usuário rebaixado para USER com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error demoting user:', error);
      toast.error(`Erro ao rebaixar usuário: ${error.message}`);
    }
  });

  return {
    users,
    isLoading,
    error,
    refetch,
    updateUser: updateUserMutation.mutate,
    promoteUser: promoteUserMutation.mutate,
    demoteUser: demoteUserMutation.mutate,
    isUpdating: updateUserMutation.isPending || promoteUserMutation.isPending || demoteUserMutation.isPending
  };
}
