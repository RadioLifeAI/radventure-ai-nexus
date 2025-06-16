import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, UserCheck, UserX, Crown, Shield, Edit, Trash2, 
  Plus, Search, Filter, Download, Ban
} from "lucide-react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { UserProfile } from "@/types/admin";

// Define database profile type to match actual database structure
interface DatabaseProfile {
  id: string;
  type: 'USER' | 'ADMIN';
  email?: string;
  username?: string;
  full_name?: string;
  nickname?: string;
  bio?: string;
  avatar_url?: string;
  country_code?: string;
  city?: string;
  state?: string;
  birthdate?: string;
  college?: string;
  preferences?: any;
  academic_specialty?: string;
  medical_specialty?: string;
  academic_stage?: 'first_year' | 'second_year' | 'third_year' | 'fourth_year' | 'fifth_year' | 'sixth_year' | 'intern' | 'resident' | 'doctor' | 'specialist';
  total_points: number;
  radcoin_balance: number;
  current_streak: number;
  created_at: string;
  updated_at: string;
}

export function UserManagement() {
  const { hasPermission } = useAdminPermissions();
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
    enabled: hasPermission('USERS', 'READ')
  });

  // Mutation para atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<DatabaseProfile> & { id: string }) => {
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

  if (!hasPermission('USERS', 'READ')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
          <p className="text-gray-600">Você não tem permissão para gerenciar usuários.</p>
        </div>
      </div>
    );
  }

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            <p className="text-xs text-gray-600">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{adminUsers}</div>
            <p className="text-xs text-gray-600">Com privilégios especiais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <UserX className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">68%</div>
            <p className="text-xs text-gray-600">Free para Premium</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters e Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>Gerencie todos os usuários da plataforma</CardDescription>
            </div>
            <div className="flex gap-2">
              {hasPermission('USERS', 'CREATE') && (
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Usuário
                </Button>
              )}
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email ou username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={(value: "all" | "USER" | "ADMIN") => setFilterType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="USER">Usuários</SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de usuários */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>RadCoins</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Carregando usuários...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name || user.username}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.type === 'ADMIN' ? 'destructive' : 'secondary'}>
                          {user.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.medical_specialty || 'Não informado'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {user.total_points?.toLocaleString() || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm text-yellow-600">
                          {user.radcoin_balance?.toLocaleString() || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {hasPermission('USERS', 'UPDATE') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('USERS', 'DELETE') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleBanMutation.mutate({ userId: user.id, banned: true })}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
                academic_stage: formData.get('academic_stage') as 'first_year' | 'second_year' | 'third_year' | 'fourth_year' | 'fifth_year' | 'sixth_year' | 'intern' | 'resident' | 'doctor' | 'specialist',
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
                        <SelectItem value="first_year">1º Ano</SelectItem>
                        <SelectItem value="second_year">2º Ano</SelectItem>
                        <SelectItem value="third_year">3º Ano</SelectItem>
                        <SelectItem value="fourth_year">4º Ano</SelectItem>
                        <SelectItem value="fifth_year">5º Ano</SelectItem>
                        <SelectItem value="sixth_year">6º Ano</SelectItem>
                        <SelectItem value="intern">Interno</SelectItem>
                        <SelectItem value="resident">Residente</SelectItem>
                        <SelectItem value="doctor">Médico</SelectItem>
                        <SelectItem value="specialist">Especialista</SelectItem>
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
