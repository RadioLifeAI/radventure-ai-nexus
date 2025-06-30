
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, History, Crown, Flag } from "lucide-react";
import { UserFilters } from "./UserFilters";
import { UsersTable } from "./UsersTable";
import { UserBenefitsVerification } from "./UserBenefitsVerification";
import { AdminRoleAuditLog } from "./AdminRoleAuditLog";
import { UserManagementAdvanced } from "./UserManagementAdvanced";
import { ReportsManagementTable } from "../reports/ReportsManagementTable";
import { ReportsStats } from "../reports/ReportsStats";
import { useUserReportsAdmin } from "@/hooks/useUserReportsAdmin";
import type { UserProfile } from "@/types/admin";

interface UserManagementTabsProps {
  users: UserProfile[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: "all" | "USER" | "ADMIN";
  setFilterType: (type: "all" | "USER" | "ADMIN") => void;
  onEditUser: (user: UserProfile) => void;
  onBanUser: (userId: string) => void;
  onPromoteUser: (userId: string) => void;
}

export function UserManagementTabs({
  users,
  isLoading,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  onEditUser,
  onBanUser,
  onPromoteUser
}: UserManagementTabsProps) {
  const { stats } = useUserReportsAdmin();

  return (
    <Tabs defaultValue="users" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-xl">
        <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Users className="h-4 w-4" />
          Lista de Usuários
        </TabsTrigger>
        <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Flag className="h-4 w-4" />
          Reports
        </TabsTrigger>
        <TabsTrigger value="advanced" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Crown className="h-4 w-4" />
          Gestão Avançada
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
              onEditUser={onEditUser}
              onBanUser={onBanUser}
              onPromoteUser={onPromoteUser}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/30">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <Flag className="h-5 w-5" />
              Reports dos Usuários
            </CardTitle>
            <CardDescription className="text-red-700">
              Visualize e gerencie todos os reports enviados pelos usuários
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ReportsStats stats={stats} />
            <ReportsManagementTable />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="advanced" className="space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/30">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <Crown className="h-5 w-5" />
              Gestão Avançada de Usuários
            </CardTitle>
            <CardDescription className="text-red-700">
              Controle total sobre usuários, roles e permissões administrativas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <UserManagementAdvanced />
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
  );
}
