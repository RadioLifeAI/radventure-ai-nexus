
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Trophy, Coins, TrendingUp, Settings, DollarSign } from "lucide-react";
import { RewardManagementIntegrated } from "../RewardManagementIntegrated";
import { EconomyTab } from "./EconomyTab";
import { RewardConfigurationTab } from "./RewardConfigurationTab";
import { AdvancedAnalyticsTab } from "./AdvancedAnalyticsTab";

export function RewardTabs() {
  return (
    <Tabs defaultValue="management" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 p-1 rounded-xl">
        <TabsTrigger value="management" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Trophy className="h-4 w-4" />
          Gestão
        </TabsTrigger>
        <TabsTrigger value="economy" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Coins className="h-4 w-4" />
          Economia
        </TabsTrigger>
        <TabsTrigger value="config" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Settings className="h-4 w-4" />
          Configurações
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <TrendingUp className="h-4 w-4" />
          Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="management" className="space-y-6">
        <RewardManagementIntegrated />
      </TabsContent>

      <TabsContent value="economy" className="space-y-6">
        <EconomyTab />
      </TabsContent>

      <TabsContent value="config" className="space-y-6">
        <RewardConfigurationTab />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <AdvancedAnalyticsTab />
      </TabsContent>
    </Tabs>
  );
}
