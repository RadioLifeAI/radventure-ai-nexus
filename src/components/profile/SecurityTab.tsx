
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Crown, Settings, ExternalLink } from "lucide-react";

interface SecurityTabProps {
  isAdmin: boolean;
  onNavigateToAdmin: () => void;
}

export function SecurityTab({ isAdmin, onNavigateToAdmin }: SecurityTabProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Segurança & Acesso</h3>
        <p className="text-gray-600">
          Gerencie suas configurações de segurança e permissões
        </p>
      </div>

      {/* Status do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Status da Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Tipo de Conta:</span>
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? (
                <><Crown className="h-3 w-3 mr-1" /> Administrador</>
              ) : (
                'Usuário'
              )}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Autenticação:</span>
            <Badge variant="outline" className="text-green-600 border-green-600">
              ✓ Ativa
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Acesso Administrativo */}
      {isAdmin && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Crown className="h-5 w-5" />
              Acesso Administrativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-600 mb-4">
              Você possui privilégios de administrador nesta plataforma.
            </p>
            <Button
              onClick={onNavigateToAdmin}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Settings className="mr-2 h-4 w-4" />
              Acessar Painel Admin
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Configurações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-600" />
            Configurações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Senha</h4>
              <p className="text-sm text-gray-600">Alterar sua senha atual</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Em breve
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Autenticação de Dois Fatores</h4>
              <p className="text-sm text-gray-600">Adicione uma camada extra de segurança</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Em breve
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">Sessões Ativas</h4>
              <p className="text-sm text-gray-600">Gerencie seus dispositivos conectados</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Em breve
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Privacidade */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Suas informações são protegidas de acordo com nossa{' '}
              <button className="text-blue-600 hover:underline">
                Política de Privacidade
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Última atualização de segurança: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
