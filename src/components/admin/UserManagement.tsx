
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { UserStatsCards } from "./users/UserStatsCards";
import { UserFilters } from "./users/UserFilters";
import { UsersTable } from "./users/UsersTable";
import { UserEditModal } from "./users/UserEditModal";
import { UserBenefitsVerification } from "./users/UserBenefitsVerification";
import type { UserProfile } from "@/types/admin";
import { toast } from "sonner";
import { Users, Settings } from "lucide-react";

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "USER" | "ADMIN">("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-users", searchTerm, filterType],
    queryFn: async () => {
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
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleBanUser = async (userId: string) => {
    try {
      // Implementar lógica de banimento
      const { error } = await supabase
        .from("profiles")
        .update({ 
          type: "USER", // Remove admin privileges if any
          updated_at: new Date().toISOString() 
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Usuário foi restrito com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(`Erro ao restringir usuário: ${error.message}`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-gray-600">Gerencie usuários, permissões e benefícios</p>
        </div>
      </div>

      <UserStatsCards 
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        adminUsers={adminUsers}
      />

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lista de Usuários
          </TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Verificação de Benefícios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuários do Sistema</CardTitle>
              <CardDescription>
                Lista completa de usuários com controles administrativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterType={filterType}
                setFilterType={setFilterType}
              />

              <UsersTable
                users={users}
                isLoading={isLoading}
                onEditUser={handleEditUser}
                onBanUser={handleBanUser}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <UserBenefitsVerification />
        </TabsContent>
      </Tabs>

      <UserEditModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
