
import React from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { UserProfile } from "@/components/UserProfile";
import { EventsSectionPlayer } from "@/components/EventsSectionPlayer";
import { DashboardSkeleton } from "@/components/ui/skeleton-loader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import { useSpecialtiesData } from "@/hooks/useSpecialtiesData";
import { useLevelUpNotifications } from "@/hooks/useLevelUpNotifications";
import { useAutomaticRewards } from "@/hooks/useAutomaticRewards";
import { useSubscriptionRewards } from "@/hooks/useSubscriptionRewards";
import { QuickActionsSection } from "@/components/dashboard/QuickActionsSection";
import { SpecialtiesSection } from "@/components/dashboard/SpecialtiesSection";
import { EmptySpecialtiesMessage } from "@/components/dashboard/EmptySpecialtiesMessage";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { RadBotFloatingButton } from "@/components/radbot/RadBotFloatingButton";
import { RadBotChat } from "@/components/radbot/RadBotChat";
import { useState } from "react";

export default function Dashboard() {
  const { specialties, events, profile, isLoading: dashboardLoading } = useDashboardData();
  const { specialtiesWithProgress, isLoading: progressLoading } = useSpecialtiesData(specialties);
  const {
    handleCentralCasos,
    handleCriarJornada,
    handleEventos,
    handleConquistas,
    handleEnterEvent
  } = useDashboardHandlers();

  // Ativar sistemas automáticos
  useLevelUpNotifications();
  useAutomaticRewards();
  useSubscriptionRewards();

  const isLoading = dashboardLoading || progressLoading;
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
        <HeaderNav />
        <main className="flex-1 w-full px-2 md:px-4 lg:px-8 xl:px-16 pt-4 pb-10 overflow-x-hidden">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 w-full flex flex-col gap-4 px-2 md:px-4 lg:px-8 xl:px-16 pt-4 pb-10 overflow-x-hidden">
        <UserProfile />
        <EventsSectionPlayer onEnterEvent={handleEnterEvent} />
        
        <QuickActionsSection
          onCentralCasos={handleCentralCasos}
          onCriarJornada={handleCriarJornada}
          onEventos={handleEventos}
          onConquistas={handleConquistas}
        />

        {specialties.length > 0 ? (
          <SpecialtiesSection 
            specialties={specialties}
            specialtiesWithProgress={specialtiesWithProgress}
          />
        ) : (
          <EmptySpecialtiesMessage />
        )}
      </main>

      <DashboardFooter 
        specialties={specialties}
        events={events}
        profile={profile}
      />

      <RadBotFloatingButton 
        onClick={() => setIsChatOpen(true)} 
      />
      
      <RadBotChat 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
