
import React, { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserRankings } from "@/hooks/useUserRankings";
import { useUserLevel } from "@/hooks/useUserLevel";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useLevelUpNotifications } from "@/hooks/useLevelUpNotifications";
import { useLevelUpModal } from "@/hooks/useLevelUpModal";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { useSubscriptionBenefits } from "@/hooks/useSubscriptionBenefits";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trophy, Zap, Target, Settings, Shield } from "lucide-react";
import { ProfileSettingsModal } from "./profile/ProfileSettingsModal";
import { ProfileCompletionProgress } from "./profile/ProfileCompletionProgress";
import { OnboardingWizard } from "./profile/OnboardingWizard";
import { XPProgressBar } from "./profile/XPProgressBar";
import { LevelUpModal } from "./profile/LevelUpModal";
import { CollaboratorBadge } from "./profile/CollaboratorBadge";

export function UserProfile() {
  const { profile, isLoading } = useUserProfile();
  const { userRank, loading: rankingsLoading } = useUserRankings();
  const { levelData, loading: levelLoading } = useUserLevel();
  const { isAdmin } = useAdminAccess();
  const { benefits } = useSubscriptionBenefits();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Ativar sistema de notificações de level up
  useLevelUpNotifications();

  // Hooks para funcionalidades específicas
  const { levelUpModal, closeLevelUpModal } = useLevelUpModal(profile?.id);
  const { isProfileComplete } = useProfileCompletion(profile);
  const { showOnboarding, handleOnboardingClose } = useOnboardingFlow(profile, isLoading);

  if (isLoading || levelLoading) {
    return (
      <section className="flex flex-col md:flex-row gap-6 items-center justify-between w-full rounded-xl px-6 md:px-10 py-7 bg-gradient-to-br from-[#232983] via-[#224ba7] to-[#25bfff] drop-shadow-lg mb-8 mt-3 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/20"></div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-white/20 rounded"></div>
            <div className="h-4 w-32 bg-white/20 rounded"></div>
            <div className="flex gap-4">
              <div className="h-6 w-24 bg-white/20 rounded-full"></div>
              <div className="h-6 w-32 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="h-12 w-48 bg-white/20 rounded-xl"></div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-800 font-medium">Erro ao carregar perfil do usuário</p>
        <p className="text-red-600 text-sm mt-1">Tente recarregar a página</p>
      </section>
    );
  }

  const displayName = profile.full_name || profile.username || 'Usuário';
  const location = `${profile.city || 'Não informado'}, ${profile.state || 'N/A'}`;
  const totalPoints = profile.total_points || 0;
  const radcoins = profile.radcoin_balance || 0;
  const currentStreak = profile.current_streak || 0;
  const displayRank = rankingsLoading ? null : userRank;

  return (
    <>
      <section className="space-y-4 md:space-y-6">
        {/* Seção Principal do Perfil */}
        <div className="flex flex-col gap-4 lg:gap-6 items-center justify-between w-full rounded-xl px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-7 bg-gradient-to-br from-[#232983] via-[#224ba7] to-[#25bfff] drop-shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 w-full">
            <div className="relative flex-shrink-0">
              <img 
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} 
                alt="Avatar" 
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-4 border-cyan-400 shadow-lg hover:scale-110 transition-transform duration-300 object-cover bg-white" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`;
                }}
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex-1 text-center lg:text-left w-full max-w-full">
              <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white tracking-tight flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-3 mb-2">
                <span className="truncate max-w-full">{displayName}</span>
                <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
                  {isAdmin && (
                    <Badge className="bg-yellow-500 text-yellow-900 font-bold text-xs">
                      ADMIN
                    </Badge>
                  )}
                  {/* Exibir selo de colaborador */}
                  <CollaboratorBadge badge={benefits.collaboratorBadge} size="sm" />
                </div>
              </h2>
              
              {/* Barra de XP e Nível */}
              {levelData && (
                <div className="mb-3 w-full max-w-full">
                  <XPProgressBar
                    level={levelData.level}
                    currentXP={totalPoints}
                    nextLevelXP={levelData.next_level_xp}
                    progress={levelData.progress_percentage}
                    title={profile.active_title}
                    compact={true}
                  />
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-3 lg:gap-4 text-cyan-50 font-medium text-xs sm:text-sm lg:text-base mb-3">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 flex-shrink-0" />
                  <span>{totalPoints.toLocaleString()} pts</span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400 flex-shrink-0" />
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{location}</span>
                </div>
                {currentStreak > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                    <span className="whitespace-nowrap">{currentStreak} dia{currentStreak > 1 ? 's' : ''} seguidos</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm">
                <Badge className="bg-cyan-600/70 px-2 sm:px-3 py-1 rounded-2xl text-white font-medium flex items-center gap-1 sm:gap-2 hover:bg-cyan-600/80 transition-colors">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  {rankingsLoading ? (
                    <span className="flex items-center gap-1">
                      <span className="hidden sm:inline">Ranking:</span>
                      <div className="w-6 sm:w-8 h-3 bg-white/30 rounded animate-pulse"></div>
                    </span>
                  ) : displayRank ? (
                    <span><span className="hidden sm:inline">Ranking:</span> <b>#{displayRank}</b></span>
                  ) : (
                    <span><span className="hidden sm:inline">Ranking:</span> <b>...</b></span>
                  )}
                </Badge>
                
                <Badge className="bg-gradient-to-r from-yellow-500/70 to-orange-500/70 px-2 sm:px-3 py-1 rounded-2xl text-white font-medium flex items-center gap-1 sm:gap-2 hover:from-yellow-500/80 hover:to-orange-500/80 transition-colors">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                  <span className="truncate">
                    {radcoins > 999 ? `${(radcoins / 1000).toFixed(1)}k` : radcoins.toLocaleString()}
                    <span className="hidden sm:inline"> RadCoins</span>
                  </span>
                </Badge>
                
                {profile.medical_specialty && (
                  <Badge className="bg-purple-600/70 px-2 sm:px-3 py-1 rounded-2xl text-white font-medium hover:bg-purple-600/80 transition-colors truncate max-w-[120px] sm:max-w-full">
                    {profile.medical_specialty}
                  </Badge>
                )}

                {/* Exibir plano ativo se houver */}
                {benefits.hasActivePlan && benefits.planName && (
                  <Badge className="bg-green-600/70 px-2 sm:px-3 py-1 rounded-2xl text-white font-medium hover:bg-green-600/80 transition-colors truncate">
                    📋 {benefits.planName}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => navigate('/app/casos')}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg touch-target px-4 sm:px-6 lg:px-8 py-3 text-sm sm:text-base lg:text-lg font-bold rounded-xl text-white hover:scale-105 transition-all duration-300 hover:shadow-xl group w-full sm:w-auto"
            >
              <span className="group-hover:animate-pulse text-sm sm:text-base">🚀</span>
              <span className="ml-2 truncate">Começar Novo Desafio</span>
            </Button>
            
            <div className="flex gap-3 justify-center sm:justify-start">
              <Button 
                variant="outline"
                onClick={() => setIsSettingsOpen(true)}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 touch-target px-3 sm:px-4 py-3 rounded-xl transition-all duration-300"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {isAdmin && (
                <Button 
                  onClick={() => navigate('/admin')}
                  className="bg-gradient-to-r from-red-500 to-pink-600 shadow-lg touch-target px-3 sm:px-4 lg:px-6 py-3 text-sm sm:text-base lg:text-lg font-bold rounded-xl text-white hover:scale-105 transition-all duration-300 hover:shadow-xl flex items-center gap-2"
                >
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="hidden sm:inline">Painel Admin</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Progresso do Perfil - Renderizado condicionalmente */}
        {!isProfileComplete && (
          <ProfileCompletionProgress 
            profile={profile} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
          />
        )}

        {/* Benefícios da Assinatura - Exibir se tiver plano ativo */}
        {benefits.hasActivePlan && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
              🎯 Benefícios do Seu Plano {benefits.planName}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{benefits.monthlyRadcoins}</div>
                <div className="text-sm text-gray-600">RadCoins/mês</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">+{benefits.eliminationAids - 3}</div>
                <div className="text-sm text-gray-600">Eliminações extras</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">+{benefits.skipAids - 1}</div>
                <div className="text-sm text-gray-600">Pulos extras</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">+{((benefits.xpMultiplier - 1) * 100).toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Bônus XP</div>
              </div>
            </div>
          </div>
        )}
      </section>

      <ProfileSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
      />

      <LevelUpModal
        isOpen={levelUpModal.show}
        onClose={closeLevelUpModal}
        newLevel={levelUpModal.newLevel}
        newTitle={levelUpModal.newTitle}
        radcoinReward={levelUpModal.radcoinReward}
      />
    </>
  );
}
