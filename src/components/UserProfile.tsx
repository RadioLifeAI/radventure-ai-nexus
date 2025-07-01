import React, { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserRankings } from "@/hooks/useUserRankings";
import { useUserLevel } from "@/hooks/useUserLevel";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trophy, Zap, Target, Settings, Shield, Crown } from "lucide-react";
import { ProfileSettingsModal } from "./profile/ProfileSettingsModal";
import { ProfileCompletionProgress } from "./profile/ProfileCompletionProgress";
import { OnboardingWizard } from "./profile/OnboardingWizard";
import { XPProgressBar } from "./profile/XPProgressBar";
import { LevelUpModal } from "./profile/LevelUpModal";

export function UserProfile() {
  const { profile, isLoading } = useUserProfile();
  const { userRank, loading: rankingsLoading } = useUserRankings();
  const { levelData, loading: levelLoading } = useUserLevel();
  const { isAdmin } = useAdminAccess();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState<{
    show: boolean;
    newLevel: number;
    newTitle: string;
    radcoinReward: number;
  }>({ show: false, newLevel: 0, newTitle: '', radcoinReward: 0 });

  // Verificar se é um perfil novo (para mostrar onboarding)
  useEffect(() => {
    if (profile && !isLoading) {
      const isNewProfile = !profile.full_name || (!profile.city && !profile.state);
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${profile.id}`);
      
      if (isNewProfile && !hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [profile, isLoading]);

  // Listener para notificações de level up
  useEffect(() => {
    if (!profile?.id) return;

    const checkForLevelUpNotification = () => {
      const levelUpData = localStorage.getItem(`levelup_${profile.id}`);
      if (levelUpData) {
        const data = JSON.parse(levelUpData);
        setLevelUpModal({
          show: true,
          newLevel: data.new_level,
          newTitle: data.title_unlocked,
          radcoinReward: data.radcoin_reward
        });
        localStorage.removeItem(`levelup_${profile.id}`);
      }
    };

    checkForLevelUpNotification();
    
    // Verificar a cada 3 segundos por novas notificações
    const interval = setInterval(checkForLevelUpNotification, 3000);
    return () => clearInterval(interval);
  }, [profile?.id]);

  // Calcular se o perfil está completo (mesma lógica do ProfileCompletionProgress)
  const isProfileComplete = profile ? (() => {
    const completionFields = [
      { completed: !!(profile.full_name && profile.full_name.trim().length > 0) },
      { completed: !!(profile.city && profile.state) },
      { completed: !!(profile.medical_specialty && profile.medical_specialty.trim().length > 0) },
      { completed: !!(profile.academic_stage && profile.college) },
      { completed: !!profile.birthdate },
      { completed: !!(profile.bio && profile.bio.trim().length > 20) }
    ];
    
    const completedCount = completionFields.filter(field => field.completed).length;
    return completedCount === completionFields.length;
  })() : false;

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    if (profile) {
      localStorage.setItem(`onboarding_${profile.id}`, 'completed');
    }
  };

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

  // Usar ranking real do sistema - com fallback suave para loading
  const displayRank = rankingsLoading ? null : userRank;

  return (
    <>
      <section className="space-y-6">
        {/* Seção Principal do Perfil */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between w-full rounded-xl px-6 md:px-10 py-7 bg-gradient-to-br from-[#232983] via-[#224ba7] to-[#25bfff] drop-shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img 
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full border-4 border-cyan-400 shadow-lg hover:scale-110 transition-transform duration-300 object-cover bg-white" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`;
                }}
              />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                {displayName}
                {isAdmin && (
                  <Badge className="bg-yellow-500 text-yellow-900 font-bold">
                    ADMIN
                  </Badge>
                )}
              </h2>
              
              {/* Barra de XP e Nível */}
              {levelData && (
                <div className="mt-2 mb-2">
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
              
              <div className="flex items-center gap-4 mt-1 text-cyan-50 font-medium text-base">
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span>{totalPoints.toLocaleString()} pts</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  <span>{location}</span>
                </div>
                {currentStreak > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-green-400" />
                    <span>{currentStreak} dia{currentStreak > 1 ? 's' : ''} seguidos</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 mt-3 text-sm">
                <Badge className="bg-cyan-600/70 px-4 py-1 rounded-2xl text-white font-medium flex items-center gap-2 hover:bg-cyan-600/80 transition-colors">
                  <Trophy className="h-4 w-4" />
                  {rankingsLoading ? (
                    <span className="flex items-center gap-1">
                      Ranking Nacional: <div className="w-8 h-4 bg-white/30 rounded animate-pulse"></div>
                    </span>
                  ) : displayRank ? (
                    <span>Ranking Nacional: <b>#{displayRank}</b></span>
                  ) : (
                    <span>Ranking Nacional: <b>Calculando...</b></span>
                  )}
                </Badge>
                
                <Badge className="bg-gradient-to-r from-yellow-500/70 to-orange-500/70 px-4 py-1 rounded-2xl text-white font-medium flex items-center gap-2 hover:from-yellow-500/80 hover:to-orange-500/80 transition-colors">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  {radcoins.toLocaleString()} RadCoins
                </Badge>
                
                {profile.medical_specialty && (
                  <Badge className="bg-purple-600/70 px-4 py-1 rounded-2xl text-white font-medium hover:bg-purple-600/80 transition-colors">
                    {profile.medical_specialty}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/app/casos')}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg px-8 py-3 text-lg font-extrabold rounded-xl text-white hover:scale-105 transition-all duration-300 hover:shadow-xl group"
            >
              <span className="group-hover:animate-pulse">🚀</span>
              <span className="ml-2">Começar Novo Desafio</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsSettingsOpen(true)}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-4 py-3 rounded-xl transition-all duration-300"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {isAdmin && (
              <Button 
                onClick={() => navigate('/admin')}
                className="bg-gradient-to-r from-red-500 to-pink-600 shadow-lg px-6 py-3 text-lg font-bold rounded-xl text-white hover:scale-105 transition-all duration-300 hover:shadow-xl flex items-center gap-2"
              >
                <Shield className="h-5 w-5" />
                Painel Admin
              </Button>
            )}
          </div>
        </div>

        {/* Progresso do Perfil - Renderizado condicionalmente */}
        {!isProfileComplete && (
          <ProfileCompletionProgress 
            profile={profile} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
          />
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
        onClose={() => setLevelUpModal(prev => ({ ...prev, show: false }))}
        newLevel={levelUpModal.newLevel}
        newTitle={levelUpModal.newTitle}
        radcoinReward={levelUpModal.radcoinReward}
      />
    </>
  );
}
