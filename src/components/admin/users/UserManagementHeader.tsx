
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Users, UserCheck } from "lucide-react";

interface UserManagementHeaderProps {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
}

export function UserManagementHeader({ totalUsers, activeUsers, adminUsers }: UserManagementHeaderProps) {
  return (
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
  );
}
