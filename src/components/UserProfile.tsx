
import React, { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trophy, Zap, Target, Settings, Shield } from "lucide-react";
import { ProfileSettingsModal } from "./profile/ProfileSettingsModal";
import { ProfileCompletionProgress } from "./profile/ProfileCompletionProgress";
import { OnboardingWizard } from "./profile/OnboardingWizard";

export function UserProfile() {
  const { profile, isLoading } = useUserProfile();
  const { isAdmin } = useAdminAccess();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    if (profile) {
      localStorage.setItem(`onboarding_${profile.id}`, 'completed');
    }
  };

  if (isLoading) {
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

  const displayName = profile?.full_name || profile?.username || 'Usuário';
  const location = `${profile?.city || 'São Paulo'}, ${profile?.state || 'SP'}`;
  const totalPoints = profile?.total_points || 0;
  const radcoins = profile?.radcoin_balance || 0;
  const currentStreak = profile?.current_streak || 0;

  // Calcular ranking baseado em pontos (simulado por enquanto)
  const ranking = Math.max(1, Math.floor(Math.random() * 100) + 1);

  return (
    <>
      <section className="space-y-6">
        {/* Seção Principal do Perfil */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between w-full rounded-xl px-6 md:px-10 py-7 bg-gradient-to-br from-[#232983] via-[#224ba7] to-[#25bfff] drop-shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img 
                src={profile?.avatar_url || "https://randomuser.me/api/portraits/women/90.jpg"} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full border-4 border-cyan-400 shadow-lg hover:scale-110 transition-transform duration-300" 
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
                  Ranking Nacional: <b>#{ranking}</b>
                </Badge>
                
                <Badge className="bg-gradient-to-r from-yellow-500/70 to-orange-500/70 px-4 py-1 rounded-2xl text-white font-medium flex items-center gap-2 hover:from-yellow-500/80 hover:to-orange-500/80 transition-colors">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  {radcoins.toLocaleString()} RadCoins
                </Badge>
                
                {profile?.medical_specialty && (
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

        {/* Progresso do Perfil */}
        {profile && (
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
    </>
  );
}
