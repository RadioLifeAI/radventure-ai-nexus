
import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useProfileRewards } from '@/hooks/useProfileRewards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Star, Target } from 'lucide-react';

interface ProfileField {
  field: string;
  label: string;
  reward: number;
  isCompleted: boolean;
}

export function ProfileCompletionRewards() {
  const { profile } = useUserProfile();
  const { recheckRewards } = useProfileRewards();

  if (!profile) return null;

  const profileFields: ProfileField[] = [
    { 
      field: 'full_name', 
      label: 'Nome Completo', 
      reward: 10, 
      isCompleted: !!(profile.full_name?.trim()) 
    },
    { 
      field: 'medical_specialty', 
      label: 'Especialidade Médica', 
      reward: 15, 
      isCompleted: !!(profile.medical_specialty?.trim()) 
    },
    { 
      field: 'academic_stage', 
      label: 'Estágio Acadêmico', 
      reward: 10, 
      isCompleted: !!(profile.academic_stage) 
    },
    { 
      field: 'city', 
      label: 'Cidade', 
      reward: 5, 
      isCompleted: !!(profile.city?.trim()) 
    },
    { 
      field: 'state', 
      label: 'Estado', 
      reward: 5, 
      isCompleted: !!(profile.state?.trim()) 
    },
    { 
      field: 'bio', 
      label: 'Biografia', 
      reward: 8, 
      isCompleted: !!(profile.bio?.trim()) 
    },
    { 
      field: 'college', 
      label: 'Instituição', 
      reward: 12, 
      isCompleted: !!(profile.college?.trim()) 
    }
  ];

  const completedFields = profileFields.filter(f => f.isCompleted);
  const completionPercentage = (completedFields.length / profileFields.length) * 100;
  const totalPossibleRewards = profileFields.reduce((sum, f) => sum + f.reward, 0) + 25; // +25 bônus
  const earnedRewards = completedFields.reduce((sum, f) => sum + f.reward, 0) + 
                        (completionPercentage === 100 ? 25 : 0);

  // Não mostrar se perfil já está 100% completo
  if (completionPercentage === 100) return null;

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Gift className="h-5 w-5" />
          Complete seu Perfil e Ganhe RadCoins!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Geral */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-orange-700">
              Progresso do Perfil
            </span>
            <span className="text-sm font-bold text-orange-800">
              {Math.round(completionPercentage)}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Campos Pendentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {profileFields
            .filter(field => !field.isCompleted)
            .slice(0, 4) // Mostrar apenas os primeiros 4 pendentes
            .map((field) => (
              <div key={field.field} className="flex items-center justify-between p-2 bg-white/60 rounded-lg">
                <span className="text-sm text-gray-700">{field.label}</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  +{field.reward} RadCoins
                </Badge>
              </div>
            ))}
        </div>

        {/* Resumo de Recompensas */}
        <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Total Disponível: {totalPossibleRewards} RadCoins
            </span>
          </div>
          <Badge className="bg-orange-600 text-white">
            {profileFields.length - completedFields.length} campos restantes
          </Badge>
        </div>

        {/* Bônus Especial */}
        {completionPercentage >= 80 && completionPercentage < 100 && (
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              🎉 Quase lá! Complete 100% e ganhe +25 RadCoins de bônus!
            </span>
          </div>
        )}

        {/* Botão de Ação */}
        <Button 
          onClick={recheckRewards}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
        >
          <Gift className="h-4 w-4 mr-2" />
          Verificar Recompensas
        </Button>
      </CardContent>
    </Card>
  );
}
