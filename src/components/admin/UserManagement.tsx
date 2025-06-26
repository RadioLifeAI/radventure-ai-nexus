
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserStatsCards } from "./users/UserStatsCards";
import { UserManagementHeader } from "./users/UserManagementHeader";
import { UserManagementTabs } from "./users/UserManagementTabs";
import { UserEditModal } from "./users/UserEditModal";
import type { UserProfile } from "@/types/admin";
import { toast } from "sonner";

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "USER" | "ADMIN">("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-users", searchTerm, filterType],
    queryFn: async () => {
      console.log("Carregando usuários para gestão...");
      
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterType !== "all") {
        query = query.eq("type", filterType);
      }

      if (searchTerm) {
        query = query.or(
          `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) {
        console.error("Erro ao carregar usuários:", error);
        throw error;
      }
      
      console.log("Usuários carregados:", data?.length);
      return data as UserProfile[];
    },
  });

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handlePromoteUser = async (userId: string) => {
    try {
      console.log("Promovendo usuário a ADMIN:", userId);
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          type: "ADMIN",
          updated_at: new Date().toISOString() 
        })
        .eq("id", userId);

      if (error) throw error;

      // Adicionar role administrativa básica
      const { error: roleError } = await supabase
        .from("admin_user_roles")
        .insert({
          user_id: userId,
          admin_role: "TechAdmin",
          assigned_by: userId, // Pode ser melhorado para usar o admin atual
          is_active: true
        })
        .select();

      if (roleError) {
        console.warn("Aviso: Não foi possível adicionar role administrativa:", roleError);
      }

      toast.success("Usuário promovido a ADMIN com sucesso!");
      refetch();
    } catch (error: any) {
      console.error("Erro ao promover usuário:", error);
      toast.error(`Erro ao promover usuário: ${error.message}`);
    }
  };

  const handleDemoteUser = async (userId: string) => {
    try {
      console.log("Rebaixando usuário para USER:", userId);
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          type: "USER",
          updated_at: new Date().toISOString() 
        })
        .eq("id", userId);

      if (error) throw error;

      // Desativar roles administrativas
      const { error: roleError } = await supabase
        .from("admin_user_roles")
        .update({ is_active: false })
        .eq("user_id", userId);

      if (roleError) {
        console.warn("Aviso: Não foi possível desativar roles:", roleError);
      }

      toast.success("Usuário rebaixado para USER com sucesso!");
      refetch();
    } catch (error: any) {
      console.error("Erro ao rebaixar usuário:", error);
      toast.error(`Erro ao rebaixar usuário: ${error.message}`);
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
  const adminUsers = users.filter(user => user.type === "ADMIN").length;

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
        users={users}
        isLoading={isLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        onEditUser={handleEditUser}
        onBanUser={handleDemoteUser}
        onPromoteUser={handlePromoteUser}
      />

      <UserEditModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
