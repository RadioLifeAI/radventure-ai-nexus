
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  UserX, 
  Shield, 
  Ban, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2,
  Crown,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Code,
  Database
} from "lucide-react";

export function UserManagementAdvanced() {
  const [createUserModal, setCreateUserModal] = useState(false);
  const [banUserModal, setBanUserModal] = useState<string | null>(null);
  const [newUserData, setNewUserData] = useState({
    email: "",
    full_name: "",
    type: "ADMIN" as "USER" | "ADMIN"
  });
  const [banReason, setBanReason] = useState("");

  const queryClient = useQueryClient();

  // Buscar usuários com a nova estrutura limpa
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users-clean'],
    queryFn: async () => {
      console.log('Buscando usuários na estrutura limpa...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }
      
      console.log('Usuários encontrados:', data?.length || 0);
      return data || [];
    }
  });

  // Criar usuário com a nova função simplificada
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUserData) => {
      console.log('Criando usuário com estrutura limpa:', userData);
      
      const { data, error } = await supabase
        .rpc('create_dev_user_simple', {
          p_email: userData.email,
          p_full_name: userData.full_name,
          p_type: userData.type
        });
      
      if (error) {
        console.error('Erro ao criar usuário:', error);
        throw error;
      }
      
      console.log('Usuário criado com ID:', data);
      return data;
    },
    onSuccess: () => {
      toast({ title: "✅ Usuário criado com sucesso!" });
      setCreateUserModal(false);
      setNewUserData({ email: "", full_name: "", type: "ADMIN" });
      queryClient.invalidateQueries({ queryKey: ['admin-users-clean'] });
    },
    onError: (error: any) => {
      console.error('Erro completo ao criar usuário:', error);
      toast({ 
        title: "❌ Erro ao criar usuário", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Alterar role do usuário (sem restrições)
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: "USER" | "ADMIN" }) => {
      console.log('Alterando role:', { userId, newRole });
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          type: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Atualizar role administrativa se necessário
      if (newRole === 'ADMIN') {
        const { error: roleError } = await supabase
          .from('admin_user_roles')
          .upsert({
            user_id: userId,
            admin_role: 'TechAdmin',
            assigned_by: userId,
            is_active: true,
            assigned_at: new Date().toISOString()
          });
        
        if (roleError) console.warn('Aviso ao atualizar role administrativa:', roleError);
      }
    },
    onSuccess: () => {
      toast({ title: "✅ Role alterada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['admin-users-clean'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "❌ Erro ao alterar role", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Deletar usuário (sem restrições)
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deletando usuário:', userId);
      
      // Remover dados relacionados primeiro
      await supabase.from('admin_user_roles').delete().eq('user_id', userId);
      await supabase.from('user_benefits').delete().eq('user_id', userId);
      await supabase.from('user_help_aids').delete().eq('user_id', userId);
      
      // Deletar profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "✅ Usuário deletado com sucesso!" });
      setBanUserModal(null);
      setBanReason("");
      queryClient.invalidateQueries({ queryKey: ['admin-users-clean'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "❌ Erro ao deletar usuário", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleCreateUser = () => {
    if (!newUserData.email || !newUserData.full_name) {
      toast({ 
        title: "❌ Campos obrigatórios", 
        description: "Preencha pelo menos email e nome completo",
        variant: "destructive" 
      });
      return;
    }
    createUserMutation.mutate(newUserData);
  };

  const handleDeleteUser = (userId: string) => {
    if (!banReason.trim()) {
      toast({ 
        title: "❌ Motivo obrigatório", 
        description: "Informe o motivo da exclusão",
        variant: "destructive" 
      });
      return;
    }
    deleteUserMutation.mutate(userId);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'USER': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getValidUserType = (userType: string | null | undefined): "USER" | "ADMIN" => {
    if (userType === "ADMIN") return "ADMIN";
    return "USER";
  };

  return (
    <div className="space-y-6">
      {/* Banner de Sucesso da Limpeza */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">✅ Banco de Dados Limpo e Otimizado</h3>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Limpeza completa realizada: Foreign keys problemáticas removidas, tabelas duplicadas consolidadas, 
          RLS desabilitado. Sistema pronto para desenvolvimento sem restrições!
        </p>
      </div>

      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão Avançada de Usuários</h2>
          <p className="text-gray-600">Controle total sobre usuários - Banco otimizado e sem restrições</p>
        </div>
        
        <Dialog open={createUserModal} onOpenChange={setCreateUserModal}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Criar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Criação simplificada com a nova estrutura otimizada
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                placeholder="Nome completo"
                value={newUserData.full_name}
                onChange={(e) => setNewUserData(prev => ({ ...prev, full_name: e.target.value }))}
              />
              <Select 
                value={newUserData.type} 
                onValueChange={(value: "USER" | "ADMIN") => setNewUserData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Usuário</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleCreateUser} 
                className="w-full"
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Usuários do Sistema ({users?.length || 0})
          </CardTitle>
          <CardDescription>
            Sistema otimizado - Criação, edição e exclusão sem restrições
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Carregando usuários...
            </div>
          ) : (
            <div className="space-y-4">
              {users?.map((user) => {
                const validUserType = getValidUserType(user.type);
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {getRoleIcon(validUserType)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.full_name || user.email}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleColor(validUserType)}>
                            {validUserType}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </span>
                          <span className="text-xs text-gray-500">
                            Criado em {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Alterar Role */}
                      <Select 
                        value={validUserType} 
                        onValueChange={(value: "USER" | "ADMIN") => changeRoleMutation.mutate({ userId: user.id, newRole: value })}
                        disabled={changeRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">Usuário</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Deletar usuário */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar Usuário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação deletará permanentemente o usuário {user.full_name || user.email} 
                              e todos os dados relacionados (roles, benefits, help aids).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Textarea
                            placeholder="Motivo da exclusão..."
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                          />
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setBanReason("")}>
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteUserMutation.isPending}
                            >
                              {deleteUserMutation.isPending ? "Deletando..." : "Deletar Usuário"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
              
              {users?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum usuário encontrado</p>
                  <p className="text-sm">Crie o primeiro usuário usando o botão acima</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
