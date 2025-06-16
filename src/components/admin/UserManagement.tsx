
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Crown } from "lucide-react";
import type { UserProfile } from "@/types/admin";
import { UserFilters } from "./users/UserFilters";
import { UserStatsCards } from "./users/UserStatsCards";
import { UsersTable } from "./users/UsersTable";

export function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "USER" | "ADMIN">("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Query para buscar usuários
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, filterType],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  // Mutation para atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<UserProfile> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userData.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Usuário atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  });

  // Mutation para banir/desbanir usuário
  const toggleBanMutation = useMutation({
    mutationFn: async ({ userId, banned }: { userId: string, banned: boolean }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          bio: banned ? '[BANIDO] ' + (selectedUser?.bio || '') : (selectedUser?.bio || '').replace('[BANIDO] ', '')
        })
        .eq('id', userId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Status atualizado",
        description: "O status do usuário foi alterado.",
      });
    }
  });

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const filteredUsers = users || [];
  const totalUsers = filteredUsers.length;
  const adminUsers = filteredUsers.filter(u => u.type === 'ADMIN').length;
  const activeUsers = filteredUsers.filter(u => 
    new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="text-emerald-200" />
              Gestão de Usuários
              <Crown className="text-yellow-300" />
            </h1>
            <p className="text-emerald-100 mt-2">Controle completo da base de usuários</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="text-emerald-200">Usuários Totais</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStatsCards 
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        adminUsers={adminUsers}
      />

      {/* Filters e Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>Gerencie todos os usuários da plataforma</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
          />

          <UsersTable
            users={filteredUsers}
            isLoading={isLoading}
            onEditUser={handleEditUser}
            onBanUser={(userId) => toggleBanMutation.mutate({ userId, banned: true })}
          />
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Faça alterações nos dados do usuário. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              updateUserMutation.mutate({
                id: selectedUser.id,
                full_name: formData.get('full_name') as string,
                username: formData.get('username') as string,
                medical_specialty: formData.get('medical_specialty') as string,
                academic_stage: formData.get('academic_stage') as 'Student' | 'Intern' | 'Resident' | 'Specialist',
                city: formData.get('city') as string,
                state: formData.get('state') as string,
              });
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      defaultValue={selectedUser.full_name || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      defaultValue={selectedUser.username || ''}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medical_specialty">Especialidade Médica</Label>
                    <Input
                      id="medical_specialty"
                      name="medical_specialty"
                      defaultValue={selectedUser.medical_specialty || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="academic_stage">Estágio Acadêmico</Label>
                    <Select name="academic_stage" defaultValue={selectedUser.academic_stage || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estágio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Student">Estudante</SelectItem>
                        <SelectItem value="Intern">Interno</SelectItem>
                        <SelectItem value="Resident">Residente</SelectItem>
                        <SelectItem value="Specialist">Especialista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      name="city"
                      defaultValue={selectedUser.city || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      name="state"
                      defaultValue={selectedUser.state || ''}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
