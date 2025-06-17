
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { UserStatsCards } from "./users/UserStatsCards";
import { UserFilters } from "./users/UserFilters";
import { UsersTable } from "./users/UsersTable";
import { UserEditModal } from "./users/UserEditModal";
import { UserBenefitsVerification } from "./users/UserBenefitsVerification";
import { AdminRoleAuditLog } from "./users/AdminRoleAuditLog";
import type { UserProfile } from "@/types/admin";
import { toast } from "sonner";
import { Users, Settings, History, Crown, Sparkles, UserCheck } from "lucide-react";

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

  const handleBanUser = async (userId: string) => {
    try {
      console.log("Banindo usuário:", userId);
      
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
      console.error("Erro ao restringir usuário:", error);
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
      {/* Header Gamificado */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
                <Crown className="h-8 w-8 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  Gestão de Usuários
                  <Sparkles className="h-8 w-8 text-yellow-300" />
                </h1>
                <p className="text-blue-100 text-lg">
                  Gerencie usuários, permissões e benefícios da plataforma
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge className="bg-green-500/80 text-white px-3 py-1">
                    <UserCheck className="h-4 w-4 mr-1" />
                    {totalUsers} usuários totais
                  </Badge>
                  <Badge className="bg-blue-500/80 text-white px-3 py-1">
                    <Users className="h-4 w-4 mr-1" />
                    {activeUsers} ativos
                  </Badge>
                  <Badge className="bg-purple-500/80 text-white px-3 py-1">
                    <Crown className="h-4 w-4 mr-1" />
                    {adminUsers} administradores
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserStatsCards 
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        adminUsers={adminUsers}
      />

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-xl">
          <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <Users className="h-4 w-4" />
            Lista de Usuários
          </TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <Settings className="h-4 w-4" />
            Verificação de Benefícios
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <History className="h-4 w-4" />
            Log de Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Users className="h-5 w-5" />
                Usuários do Sistema
              </CardTitle>
              <CardDescription className="text-blue-700">
                Lista completa de usuários com controles administrativos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
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
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Settings className="h-5 w-5" />
                Verificação de Benefícios
              </CardTitle>
              <CardDescription className="text-green-700">
                Gerencie benefícios e recursos premium dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <UserBenefitsVerification />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/30">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <History className="h-5 w-5" />
                Log de Auditoria
              </CardTitle>
              <CardDescription className="text-orange-700">
                Histórico de alterações de permissões e ações administrativas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <AdminRoleAuditLog />
            </CardContent>
          </Card>
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
