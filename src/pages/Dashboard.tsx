
import React from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { SpecialtiesSection } from "@/components/dashboard/SpecialtiesSection";
import { QuickActionsSection } from "@/components/dashboard/QuickActionsSection";
import { RankingWidget } from "@/components/dashboard/RankingWidget";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { RadBotFloatingButton } from "@/components/radbot/RadBotFloatingButton";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import { useUserProgress } from "@/hooks/useUserProgress";

export default function Dashboard() {
  const { specialties, events, profile, isLoading } = useDashboardData();
  const { userProgress } = useUserProgress();
  const {
    handleCentralCasos,
    handleCriarJornada,
    handleEventos,
    handleConquistas
  } = useDashboardHandlers();

  // Combinar especialidades com progresso do usuário
  const specialtiesWithProgress = specialties.map(specialty => ({
    ...specialty,
    progress: userProgress?.bySpecialty[specialty.name]?.progress || 0,
    casesCompleted: userProgress?.bySpecialty[specialty.name]?.correct || 0,
    totalCases: userProgress?.bySpecialty[specialty.name]?.total || 0
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <HeaderNav />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Bem-vindo ao RadVenture! 🚀
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sua jornada gamificada pela radiologia médica começa aqui. 
            Resolva casos, ganhe pontos e torne-se um expert! ✨
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <SpecialtiesSection 
              specialties={specialties}
              specialtiesWithProgress={specialtiesWithProgress}
            />
            <QuickActionsSection 
              onCentralCasos={handleCentralCasos}
              onCriarJornada={handleCriarJornada}
              onEventos={handleEventos}
              onConquistas={handleConquistas}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <RankingWidget />
          </div>
        </div>
      </main>

      <DashboardFooter 
        specialties={specialties}
        events={events}
        profile={profile}
      />
      
      {/* RadBot AI Floating Button */}
      <RadBotFloatingButton />
    </div>
  );
}
