
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Calendar,
  Award,
  Coins,
  CheckCircle,
  Circle
} from "lucide-react";
import { UserProfile } from "@/hooks/useUserProfile";

interface ProfileCompletionProgressProps {
  profile: UserProfile;
  onOpenSettings: () => void;
  forceHide?: boolean;
}

export function ProfileCompletionProgress({ profile, onOpenSettings, forceHide }: ProfileCompletionProgressProps) {
  // Se forceHide estiver ativo, não renderizar
  if (forceHide) {
    return null;
  }

  // Calcular campos completados
  const completionFields = [
    { 
      key: 'full_name', 
      label: 'Nome Completo', 
      icon: User, 
      completed: !!(profile.full_name && profile.full_name.trim().length > 0),
      reward: 10
    },
    { 
      key: 'location', 
      label: 'Localização', 
      icon: MapPin, 
      completed: !!(profile.city && profile.state),
      reward: 15
    },
    { 
      key: 'medical_specialty', 
      label: 'Especialidade Médica', 
      icon: GraduationCap, 
      completed: !!(profile.medical_specialty && profile.medical_specialty.trim().length > 0),
      reward: 20
    },
    { 
      key: 'academic_info', 
      label: 'Informações Acadêmicas', 
      icon: GraduationCap, 
      completed: !!(profile.academic_stage && profile.college),
      reward: 25
    },
    { 
      key: 'birthdate', 
      label: 'Data de Nascimento', 
      icon: Calendar, 
      completed: !!profile.birthdate,
      reward: 10
    },
    { 
      key: 'bio', 
      label: 'Biografia', 
      icon: User, 
      completed: !!(profile.bio && profile.bio.trim().length > 20),
      reward: 15
    }
  ];

  const completedCount = completionFields.filter(field => field.completed).length;
  const totalFields = completionFields.length;
  const completionPercentage = Math.round((completedCount / totalFields) * 100);
  const totalPossibleReward = completionFields.reduce((sum, field) => sum + field.reward, 0);
  const earnedReward = completionFields.filter(field => field.completed).reduce((sum, field) => sum + field.reward, 0);

  // Verificar se o perfil está completo
  const isProfileComplete = completionPercentage === 100;

  // Se o perfil estiver completo, não renderizar (lógica adicional de segurança)
  if (isProfileComplete) {
    console.log('✅ Perfil completo - ocultando card de progresso');
    return null;
  }

  // Definir cor do progresso baseado no percentual
  const getProgressColor = () => {
    if (completionPercentage >= 80) return "bg-green-500";
    if (completionPercentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressBgColor = () => {
    if (completionPercentage >= 80) return "bg-green-100";
    if (completionPercentage >= 50) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-800">
            <Award className="h-5 w-5" />
            Progresso do Perfil
          </div>
          <Badge 
            variant="outline"
            className="border-purple-300 text-purple-700"
          >
            {completionPercentage}% Completo
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Barra de Progresso Principal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-700 font-medium">
              {completedCount} de {totalFields} campos preenchidos
            </span>
            <div className="flex items-center gap-1 text-purple-600">
              <Coins className="h-4 w-4" />
              <span className="font-bold">{earnedReward}/{totalPossibleReward} RadCoins</span>
            </div>
          </div>
          
          <div className={`rounded-full h-4 ${getProgressBgColor()} overflow-hidden`}>
            <div 
              className={`h-full ${getProgressColor()} transition-all duration-500 rounded-full`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Lista de Campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {completionFields.map((field) => {
            const IconComponent = field.icon;
            return (
              <div 
                key={field.key}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                  field.completed 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-white/50 border border-purple-200 hover:bg-white/80'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  field.completed ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  <IconComponent className={`h-4 w-4 ${
                    field.completed ? 'text-green-600' : 'text-purple-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      field.completed ? 'text-green-800' : 'text-gray-700'
                    }`}>
                      {field.label}
                    </span>
                    {field.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Coins className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-gray-600">+{field.reward} RadCoins</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mensagem de Progresso */}
        <div className="text-center space-y-3">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-700 mb-3">
              Complete seu perfil para ganhar mais <strong>{totalPossibleReward - earnedReward} RadCoins</strong>!
            </p>
            <Button 
              onClick={onOpenSettings}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2"
            >
              <User className="h-4 w-4 mr-2" />
              Completar Perfil
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
