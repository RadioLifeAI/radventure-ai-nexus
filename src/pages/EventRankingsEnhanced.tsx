
import React from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveEventTracker } from "@/components/rankings/ActiveEventTracker";
import { EventHistoryAnalytics } from "@/components/rankings/EventHistoryAnalytics";
import { PersonalEventStats } from "@/components/rankings/PersonalEventStats";
import { EventHallOfFame } from "@/components/rankings/EventHallOfFame";
import { Trophy, BarChart3, User, Crown } from "lucide-react";
import { useEventRankingsEnhanced } from "@/hooks/useEventRankingsEnhanced";

export default function EventRankingsEnhanced() {
  const {
    activeEventRankings,
    personalStats,
    hallOfFameData,
    historyData,
    loading,
    activeTab,
    setActiveTab
  } = useEventRankingsEnhanced();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="font-extrabold text-4xl mb-3 flex items-center gap-4">
              <Trophy className="text-yellow-400" size={40} />
              Rankings de Eventos
            </h1>
            <p className="text-cyan-100 text-lg">
              Acompanhe performances, conquistas e o Hall da Fama dos eventos RadMed
            </p>
          </div>

          {/* Main Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20 p-1 rounded-xl">
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center gap-2 text-sm md:text-base"
              >
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Eventos Ativos</span>
                <span className="sm:hidden">Ativos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center gap-2 text-sm md:text-base"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger 
                value="personal" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center gap-2 text-sm md:text-base"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Meus Resultados</span>
                <span className="sm:hidden">Meus</span>
              </TabsTrigger>
              <TabsTrigger 
                value="hall-of-fame" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center gap-2 text-sm md:text-base"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Hall da Fama</span>
                <span className="sm:hidden">Hall</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="active" className="animate-fade-in">
              <ActiveEventTracker 
                rankings={activeEventRankings}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="analytics" className="animate-fade-in">
              <EventHistoryAnalytics 
                historicalData={historyData}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="personal" className="animate-fade-in">
              <PersonalEventStats 
                stats={personalStats}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="hall-of-fame" className="animate-fade-in">
              <EventHallOfFame 
                hallOfFameData={hallOfFameData}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
