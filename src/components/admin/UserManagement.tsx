
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserStatsCards } from "./users/UserStatsCards";
import { UserManagementHeader } from "./users/UserManagementHeader";
import { UserManagementTabs } from "./users/UserManagementTabs";
import { UserEditModal } from "./users/UserEditModal";
import { toast } from "sonner";

interface UsuarioAppProfile {
  id: string;
  email: string;
  nome_completo: string;
  username: string;
  tipo: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  avatar_url?: string;
  radcoin_balance: number;
  total_points: number;
  current_streak: number;
  especialidade_medica?: string;
  cidade?: string;
  estado?: string;
  created_at: string;
  updated_at: string;
}

// Interface para compatibilidade com componente existente
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  type: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  avatar_url?: string;
  total_points: number;
  radcoin_balance: number;
  medical_specialty?: string;
  academic_stage?: string;
  city?: string;
  state?: string;
  created_at: string;
  updated_at: string;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "USER" | "ADMIN">("all");
  const [selectedUser, setSelectedUser] = useState<UsuarioAppProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["usuarios-app", searchTerm, filterType],
    queryFn: async () => {
      console.log("Carregando usuários do novo sistema...");
      
      let query = supabase
        .from("usuarios_app")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (filterType !== "all") {
        if (filterType === "ADMIN") {
          query = query.in("tipo", ["ADMIN", "SUPER_ADMIN"]);
        } else {
          query = query.eq("tipo", filterType);
        }
      }

      if (searchTerm) {
        query = query.or(
          `nome_completo.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) {
        console.error("Erro ao carregar usuários:", error);
        throw error;
      }
      
      console.log("Usuários carregados:", data?.length);
      return data as UsuarioAppProfile[];
    },
  });

  const handleEditUser = (user: UserProfile) => {
    const originalUser = users.find(u => u.id === user.id);
    if (originalUser) {
      setSelectedUser(originalUser);
      setIsEditModalOpen(true);
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      console.log("Desativando usuário:", userId);
      
      const { error } = await supabase
        .from("usuarios_app")
        .update({ 
          ativo: false,
          updated_at: new Date().toISOString() 
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Usuário foi desativado com sucesso!");
      refetch();
    } catch (error: any) {
      console.error("Erro ao desativar usuário:", error);
      toast.error(`Erro ao desativar usuário: ${error.message}`);
    }
  };

  const handleUserUpdated = () => {
    refetch();
    setIsEditModalOpen(false);
  };

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(user => 
    user.updated_at && new Date(user.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;
  const adminUsers = users.filter(user => user.tipo === "ADMIN" || user.tipo === "SUPER_ADMIN").length;

  // Adaptar dados para compatibilidade com componente existente
  const adaptedUsers: UserProfile[] = users.map(user => ({
    id: user.id,
    email: user.email,
    full_name: user.nome_completo,
    username: user.username,
    type: user.tipo,
    avatar_url: user.avatar_url,
    total_points: user.total_points,
    radcoin_balance: user.radcoin_balance,
    medical_specialty: user.especialidade_medica,
    academic_stage: 'Student', // Valor padrão válido
    city: user.cidade || '', 
    state: user.estado || '', 
    created_at: user.created_at,
    updated_at: user.updated_at
  }));

  return (
    <div className="space-y-6">
      <UserManagementHeader 
        totalUsers={totalUsers}
        activeUsers={activeUsers} 
        adminUsers={adminUsers}
      />

      <UserStatsCards 
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        adminUsers={adminUsers}
      />

      <UserManagementTabs
        users={adaptedUsers}
        isLoading={isLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        onEditUser={handleEditUser}
        onBanUser={handleBanUser}
      />

      {selectedUser && (
        <UserEditModal
          user={{
            id: selectedUser.id,
            email: selectedUser.email,
            full_name: selectedUser.nome_completo,
            username: selectedUser.username,
            type: selectedUser.tipo,
            avatar_url: selectedUser.avatar_url,
            total_points: selectedUser.total_points,
            radcoin_balance: selectedUser.radcoin_balance,
            medical_specialty: selectedUser.especialidade_medica,
            academic_stage: 'Student',
            city: selectedUser.cidade || '',
            state: selectedUser.estado || '',
            created_at: selectedUser.created_at,
            updated_at: selectedUser.updated_at
          }}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}
