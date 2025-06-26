
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Ban, Crown } from "lucide-react";
import type { UserProfile } from "@/types/admin";

interface UsersTableProps {
  users: UserProfile[];
  isLoading: boolean;
  onEditUser: (user: UserProfile) => void;
  onBanUser: (userId: string) => void;
  onPromoteUser: (userId: string) => void;
}

export function UsersTable({ users, isLoading, onEditUser, onBanUser, onPromoteUser }: UsersTableProps) {
  return (
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
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                Nenhum usuário encontrado
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {user.type === 'USER' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPromoteUser(user.id)}
                        className="text-green-600 hover:text-green-700"
                        title="Promover a ADMIN"
                      >
                        <Crown className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onBanUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                      title={user.type === 'ADMIN' ? 'Rebaixar para USER' : 'Banir usuário'}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
