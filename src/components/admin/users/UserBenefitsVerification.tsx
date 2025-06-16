import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, RefreshCw, AlertTriangle, CheckCircle, Zap, Gift } from "lucide-react";

interface UserBenefitsVerificationProps {
  onUserSelected?: (userId: string) => void;
}

interface UserBenefit {
  user_id: string;
  ai_credits: number;
  elimination_aids: number;
  skip_aids: number;
  max_ai_hints_per_day: number;
  max_eliminations_per_case: number;
  max_skips_per_session: number;
  bonus_points_multiplier: number;
  has_premium_features: boolean;
  expires_at: string | null;
}

interface UserWithBenefits {
  id: string;
  full_name: string;
  email: string;
  username: string;
  subscription_tier: string;
  expected_benefits: UserBenefit;
  actual_benefits: UserBenefit | null;
  has_discrepancy: boolean;
}

export function UserBenefitsVerification({ onUserSelected }: UserBenefitsVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithBenefits | null>(null);
  const [users, setUsers] = useState<UserWithBenefits[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithBenefits[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users.slice(0, 20)); // Mostrar apenas os primeiros 20
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Buscar usuários com suas assinaturas
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id, full_name, email, username,
          subscriptions(tier, status)
        `)
        .limit(100);

      if (profilesError) throw profilesError;

      // Buscar benefícios atuais dos usuários
      const { data: benefits, error: benefitsError } = await supabase
        .from("user_benefits")
        .select("*");

      if (benefitsError) throw benefitsError;

      // Processar dados e identificar discrepâncias
      const processedUsers: UserWithBenefits[] = profiles?.map(profile => {
        const subscription = profile.subscriptions?.[0];
        const tier = subscription?.tier || "Free";
        const actualBenefit = benefits?.find(b => b.user_id === profile.id);
        
        // Definir benefícios esperados baseado no tier
        const expectedBenefits = getExpectedBenefits(tier);
        
        // Verificar se há discrepâncias
        const hasDiscrepancy = actualBenefit ? 
          !compareBenefits(expectedBenefits, actualBenefit) : 
          true; // Se não tem benefícios cadastrados, há discrepância

        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          username: profile.username,
          subscription_tier: tier,
          expected_benefits: expectedBenefits,
          actual_benefits: actualBenefit,
          has_discrepancy: hasDiscrepancy
        };
      }) || [];

      setUsers(processedUsers);
    } catch (error: any) {
      toast.error(`Erro ao carregar usuários: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getExpectedBenefits = (tier: string): UserBenefit => {
    const baseUserId = "00000000-0000-0000-0000-000000000000"; // ID placeholder
    
    switch (tier) {
      case "Pro":
        return {
          user_id: baseUserId,
          ai_credits: 50,
          elimination_aids: 10,
          skip_aids: 15,
          max_ai_hints_per_day: 10,
          max_eliminations_per_case: 3,
          max_skips_per_session: 10,
          bonus_points_multiplier: 1.2,
          has_premium_features: true,
          expires_at: null
        };
      case "Plus":
        return {
          user_id: baseUserId,
          ai_credits: 200,
          elimination_aids: 25,
          skip_aids: 30,
          max_ai_hints_per_day: 25,
          max_eliminations_per_case: 5,
          max_skips_per_session: 20,
          bonus_points_multiplier: 1.5,
          has_premium_features: true,
          expires_at: null
        };
      default: // Free
        return {
          user_id: baseUserId,
          ai_credits: 5,
          elimination_aids: 3,
          skip_aids: 5,
          max_ai_hints_per_day: 3,
          max_eliminations_per_case: 2,
          max_skips_per_session: 5,
          bonus_points_multiplier: 1.0,
          has_premium_features: false,
          expires_at: null
        };
    }
  };

  const compareBenefits = (expected: UserBenefit, actual: UserBenefit): boolean => {
    return (
      expected.ai_credits === actual.ai_credits &&
      expected.elimination_aids === actual.elimination_aids &&
      expected.skip_aids === actual.skip_aids &&
      expected.max_ai_hints_per_day === actual.max_ai_hints_per_day &&
      expected.max_eliminations_per_case === actual.max_eliminations_per_case &&
      expected.max_skips_per_session === actual.max_skips_per_session &&
      expected.bonus_points_multiplier === actual.bonus_points_multiplier &&
      expected.has_premium_features === actual.has_premium_features
    );
  };

  const syncUserBenefits = async (userId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("sync_user_benefits", {
        p_user_id: userId
      });

      if (error) throw error;

      toast.success("Benefícios sincronizados com sucesso!");
      loadUsers(); // Recarregar lista
    } catch (error: any) {
      toast.error(`Erro ao sincronizar benefícios: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const syncAllBenefits = async () => {
    setLoading(true);
    try {
      const usersWithDiscrepancy = users.filter(u => u.has_discrepancy);
      
      for (const user of usersWithDiscrepancy) {
        await supabase.rpc("sync_user_benefits", {
          p_user_id: user.id
        });
      }

      toast.success(`${usersWithDiscrepancy.length} usuários sincronizados!`);
      loadUsers();
    } catch (error: any) {
      toast.error(`Erro na sincronização em lote: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const discrepancyCount = users.filter(u => u.has_discrepancy).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Verificação de Benefícios de Usuários
          </CardTitle>
          <CardDescription>
            Identifique e corrija discrepâncias entre os benefícios esperados e atuais dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuário por nome, email ou username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button variant="outline" onClick={loadUsers} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {discrepancyCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {discrepancyCount} com problemas
                </Badge>
              )}
              <Button onClick={syncAllBenefits} disabled={loading || discrepancyCount === 0}>
                Sincronizar Todos
              </Button>
            </div>
          </div>

          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <Card key={user.id} className={`cursor-pointer transition-colors ${
                selectedUser?.id === user.id ? 'ring-2 ring-blue-500' : ''
              } ${user.has_discrepancy ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}
              onClick={() => setSelectedUser(user)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{user.full_name || user.username}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <Badge variant="outline">{user.subscription_tier}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.has_discrepancy ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          syncUserBenefits(user.id);
                        }}
                        disabled={loading}
                      >
                        Sincronizar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-500" />
              Comparação de Benefícios: {selectedUser.full_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-3">Benefícios Esperados ({selectedUser.subscription_tier})</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Créditos IA:</span>
                    <span className="font-semibold">{selectedUser.expected_benefits.ai_credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ajudas Eliminação:</span>
                    <span className="font-semibold">{selectedUser.expected_benefits.elimination_aids}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ajudas Pular:</span>
                    <span className="font-semibold">{selectedUser.expected_benefits.skip_aids}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dicas IA/dia:</span>
                    <span className="font-semibold">{selectedUser.expected_benefits.max_ai_hints_per_day}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Eliminações/caso:</span>
                    <span className="font-semibold">{selectedUser.expected_benefits.max_eliminations_per_case}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Multiplicador:</span>
                    <span className="font-semibold">{selectedUser.expected_benefits.bonus_points_multiplier}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Premium:</span>
                    <Badge variant={selectedUser.expected_benefits.has_premium_features ? "default" : "secondary"}>
                      {selectedUser.expected_benefits.has_premium_features ? "Sim" : "Não"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-blue-600 mb-3">Benefícios Atuais</h4>
                {selectedUser.actual_benefits ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Créditos IA:</span>
                      <span className={`font-semibold ${
                        selectedUser.actual_benefits.ai_credits !== selectedUser.expected_benefits.ai_credits ? 'text-red-500' : ''
                      }`}>
                        {selectedUser.actual_benefits.ai_credits}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajudas Eliminação:</span>
                      <span className={`font-semibold ${
                        selectedUser.actual_benefits.elimination_aids !== selectedUser.expected_benefits.elimination_aids ? 'text-red-500' : ''
                      }`}>
                        {selectedUser.actual_benefits.elimination_aids}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajudas Pular:</span>
                      <span className={`font-semibold ${
                        selectedUser.actual_benefits.skip_aids !== selectedUser.expected_benefits.skip_aids ? 'text-red-500' : ''
                      }`}>
                        {selectedUser.actual_benefits.skip_aids}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dicas IA/dia:</span>
                      <span className={`font-semibold ${
                        selectedUser.actual_benefits.max_ai_hints_per_day !== selectedUser.expected_benefits.max_ai_hints_per_day ? 'text-red-500' : ''
                      }`}>
                        {selectedUser.actual_benefits.max_ai_hints_per_day}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eliminações/caso:</span>
                      <span className={`font-semibold ${
                        selectedUser.actual_benefits.max_eliminations_per_case !== selectedUser.expected_benefits.max_eliminations_per_case ? 'text-red-500' : ''
                      }`}>
                        {selectedUser.actual_benefits.max_eliminations_per_case}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Multiplicador:</span>
                      <span className={`font-semibold ${
                        selectedUser.actual_benefits.bonus_points_multiplier !== selectedUser.expected_benefits.bonus_points_multiplier ? 'text-red-500' : ''
                      }`}>
                        {selectedUser.actual_benefits.bonus_points_multiplier}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Premium:</span>
                      <Badge variant={selectedUser.actual_benefits.has_premium_features ? "default" : "secondary"}
                        className={selectedUser.actual_benefits.has_premium_features !== selectedUser.expected_benefits.has_premium_features ? 'border-red-500' : ''}>
                        {selectedUser.actual_benefits.has_premium_features ? "Sim" : "Não"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-500">Nenhum benefício cadastrado</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
