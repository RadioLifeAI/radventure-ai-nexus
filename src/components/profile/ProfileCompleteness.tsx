import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  School, 
  MapPin, 
  Calendar, 
  Award,
  Gift,
  AlertCircle 
} from 'lucide-react';
import { ProfileEditModal } from './ProfileEditModal';

interface ProfileCompletenessProps {
  onEditProfile?: () => void;
}

export function ProfileCompleteness({ onEditProfile }: ProfileCompletenessProps) {
  const { profile, updateProfile } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [hasClaimedWelcomeReward, setHasClaimedWelcomeReward] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkWelcomeReward() {
      if (!profile?.id) return;

      try {
        // Verificar se já recebeu a recompensa de boas-vindas usando uma query mais simples
        const { data, error } = await supabase
          .from('radcoin_transactions_log')
          .select('id, metadata')
          .eq('user_id', profile.id)
          .eq('tx_type', 'admin_grant')
          .limit(10);

        if (error) {
          console.error('Error checking welcome reward:', error);
        } else {
          // Verificar se alguma transação tem o metadata de welcome_bonus
          const hasWelcomeBonus = data?.some(transaction => {
            const metadata = transaction.metadata as any;
            return metadata && metadata.reason === 'welcome_bonus';
          });
          setHasClaimedWelcomeReward(!!hasWelcomeBonus);
        }
      } catch (error) {
        console.error('Error checking welcome reward:', error);
      } finally {
        setLoading(false);
      }
    }

    checkWelcomeReward();
  }, [profile?.id]);

  const calculateCompleteness = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.full_name,
      profile.academic_stage,
      profile.medical_specialty,
      profile.college,
      profile.city,
      profile.birthdate
    ];
    
    const completed = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const claimWelcomeReward = async () => {
    if (!profile?.id || hasClaimedWelcomeReward) return;

    try {
      // Adicionar RadCoins de boas-vindas
      const welcomeBonus = 50;
      const newBalance = (profile.radcoin_balance || 0) + welcomeBonus;

      // Atualizar saldo
      await updateProfile({ radcoin_balance: newBalance });

      // Registrar transação usando tipo válido
      await supabase
        .from('radcoin_transactions_log')
        .insert({
          user_id: profile.id,
          tx_type: 'admin_grant',
          amount: welcomeBonus,
          balance_after: newBalance,
          metadata: { reason: 'welcome_bonus' }
        });

      setHasClaimedWelcomeReward(true);
      console.log('Welcome reward claimed successfully');
    } catch (error) {
      console.error('Error claiming welcome reward:', error);
    }
  };

  if (loading || !profile) {
    return (
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completeness = calculateCompleteness();
  const isComplete = completeness === 100;

  return (
    <>
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-cyan-900 flex items-center gap-2 text-lg">
            <User className="text-cyan-600" size={20} />
            Completude do Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-cyan-800">
                {completeness}% completo
              </span>
              <Badge 
                variant={isComplete ? "default" : "outline"}
                className={isComplete ? "bg-green-500 text-white" : "border-cyan-500 text-cyan-700"}
              >
                {isComplete ? "Completo" : "Incompleto"}
              </Badge>
            </div>
            <Progress 
              value={completeness} 
              className="h-2 bg-cyan-100"
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <School size={14} />
              <span>Estágio: {profile.academic_stage || 'Não definido'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Award size={14} />
              <span>Especialidade: {profile.medical_specialty || 'Não definida'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={14} />
              <span>Localização: {profile.city || 'Não definida'}</span>
            </div>
          </div>

          {!isComplete && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 font-medium">
                    Complete seu perfil para uma experiência personalizada!
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Casos serão recomendados com base no seu estágio acadêmico e especialidade.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!hasClaimedWelcomeReward && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="text-green-600" size={16} />
                <span className="text-sm font-medium text-green-800">
                  Bônus de Boas-vindas Disponível!
                </span>
              </div>
              <p className="text-xs text-green-700 mb-3">
                Receba 50 RadCoins por se juntar à nossa comunidade.
              </p>
              <Button 
                size="sm" 
                onClick={claimWelcomeReward}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Gift size={14} className="mr-1" />
                Resgatar Bônus
              </Button>
            </div>
          )}

          <Button 
            onClick={() => setShowEditModal(true)}
            variant="outline" 
            className="w-full border-cyan-300 text-cyan-700 hover:bg-cyan-50"
          >
            {isComplete ? "Editar Perfil" : "Completar Perfil"}
          </Button>
        </CardContent>
      </Card>

      <ProfileEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSave={updateProfile}
      />
    </>
  );
}
