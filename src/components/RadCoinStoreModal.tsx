
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift, Flame, Crown } from "lucide-react";
import { HelpPackagesTab } from "./radcoin-shop/tabs/HelpPackagesTab";
import { SpecialOffersTab } from "./radcoin-shop/tabs/SpecialOffersTab";
import { PremiumSubscriptionsTab } from "./radcoin-shop/tabs/PremiumSubscriptionsTab";
import { useRadCoinStore } from "./radcoin-shop/hooks/useRadCoinStore";

interface RadCoinStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export function RadCoinStoreModal({ isOpen, onClose, currentBalance }: RadCoinStoreModalProps) {
  const [activeTab, setActiveTab] = useState("packages");
  const { storeConfig, isStoreEnabled } = useRadCoinStore();

  // Verificar se a loja está em manutenção
  if (storeConfig.maintenance_mode) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-gradient-to-br from-red-900 to-red-800 border-red-600">
          <DialogHeader>
            <DialogTitle className="text-center text-white text-xl">🔧 Loja em Manutenção</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-red-200 mb-4">
              A Loja RadCoin está temporariamente indisponível para manutenção.
            </p>
            <p className="text-red-300 text-sm">
              Voltaremos em breve com novidades!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Verificar se a loja está desabilitada
  if (!isStoreEnabled) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-center text-white text-xl">🚫 Loja Indisponível</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-200 mb-4">
              A Loja RadCoin está temporariamente indisponível.
            </p>
            <p className="text-gray-400 text-sm">
              Entre em contato com o suporte para mais informações.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 border-purple-500/50 overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-center text-white text-2xl font-bold flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Coins className="h-6 w-6 text-white" />
            </div>
            Loja RadCoin
          </DialogTitle>
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-lg">
              💰 Saldo: {currentBalance.toLocaleString()} RadCoins
            </Badge>
          </div>
          
          {/* Anúncio da loja se configurado */}
          {storeConfig.store_announcement && (
            <div className="bg-blue-600/30 border border-blue-400/50 rounded-lg p-3 mt-2">
              <p className="text-blue-200 text-center text-sm">
                {storeConfig.store_announcement}
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-black/30 border border-purple-400/30 mb-4">
              <TabsTrigger 
                value="packages" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">Pacotes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="offers" 
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">Ofertas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="subscriptions" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Premium</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="packages" className="mt-0 h-full">
                <HelpPackagesTab currentBalance={currentBalance} />
              </TabsContent>

              <TabsContent value="offers" className="mt-0 h-full">
                <SpecialOffersTab currentBalance={currentBalance} />
              </TabsContent>

              <TabsContent value="subscriptions" className="mt-0 h-full">
                <PremiumSubscriptionsTab currentBalance={currentBalance} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
