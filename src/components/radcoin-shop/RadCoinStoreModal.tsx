
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Gift, 
  Crown, 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Zap,
  Heart,
  Brain,
  Target,
  X
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRadCoinShop } from "./hooks/useRadCoinShop";
import { HelpPackagesTab } from "./tabs/HelpPackagesTab";
import { PremiumSubscriptionsTab } from "./tabs/PremiumSubscriptionsTab";
import { SpecialOffersTab } from "./tabs/SpecialOffersTab";
import { HistoryAnalyticsTab } from "./tabs/HistoryAnalyticsTab";

interface RadCoinStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RadCoinStoreModal({ isOpen, onClose }: RadCoinStoreModalProps) {
  const [activeTab, setActiveTab] = useState("help-packages");
  const { profile } = useUserProfile();
  const { isPurchasing } = useRadCoinShop();

  const currentBalance = profile?.radcoin_balance || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] overflow-hidden p-0 bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
        {/* Header Gamificado */}
        <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white p-6 border-b border-white/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full border-2 border-yellow-400">
                <div className="w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-yellow-300" />
                  Loja RadCoin
                </h1>
                <p className="text-blue-100 text-lg">Transforme seus RadCoins em poder!</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-6 py-3 backdrop-blur-sm">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <span className="text-2xl font-bold">{currentBalance.toLocaleString()}</span>
                <span className="text-lg text-yellow-200">RadCoins</span>
              </div>
              <p className="text-sm text-blue-200 mt-1">Seu saldo atual</p>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 p-6 bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm mb-6">
              <TabsTrigger value="help-packages" className="data-[state=active]:bg-purple-600 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">Pacotes de Ajuda</span>
                <span className="sm:hidden">Ajuda</span>
              </TabsTrigger>
              <TabsTrigger value="premium-subs" className="data-[state=active]:bg-blue-600 flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Assinaturas</span>
                <span className="sm:hidden">Planos</span>
              </TabsTrigger>
              <TabsTrigger value="special-offers" className="data-[state=active]:bg-orange-600 flex items-center gap-2">
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">Ofertas</span>
                <span className="sm:hidden">Deals</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-green-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Histórico</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>

            <div className="h-full">
              <TabsContent value="help-packages" className="h-full m-0">
                <HelpPackagesTab currentBalance={currentBalance} />
              </TabsContent>
              
              <TabsContent value="premium-subs" className="h-full m-0">
                <PremiumSubscriptionsTab currentBalance={currentBalance} />
              </TabsContent>
              
              <TabsContent value="special-offers" className="h-full m-0">
                <SpecialOffersTab currentBalance={currentBalance} />
              </TabsContent>
              
              <TabsContent value="history" className="h-full m-0">
                <HistoryAnalyticsTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Loading Overlay */}
        {isPurchasing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/20 rounded-2xl p-8 text-center text-white">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <h3 className="text-xl font-bold mb-2">Processando Compra...</h3>
              <p className="text-blue-200">Aguarde enquanto processamos sua solicitação</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
