
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Zap, SkipForward, HelpCircle, Star } from "lucide-react";
import { useRadCoinStore } from "@/hooks/useRadCoinStore";

interface RadCoinStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RadCoinStoreModal({ isOpen, onClose }: RadCoinStoreModalProps) {
  const { storeItems, userBalance, purchaseHelp, isPurchasing } = useRadCoinStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'elimination': return <Zap className="h-5 w-5" />;
      case 'skip': return <SkipForward className="h-5 w-5" />;
      case 'ai_tutor': return <HelpCircle className="h-5 w-5" />;
      default: return <Coins className="h-5 w-5" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'elimination': return 'Eliminação';
      case 'skip': return 'Pular Questão';
      case 'ai_tutor': return 'Dica AI';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'elimination': return 'from-yellow-500 to-orange-500';
      case 'skip': return 'from-blue-500 to-cyan-500';
      case 'ai_tutor': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handlePurchase = (item: any) => {
    purchaseHelp({
      type: item.type,
      quantity: item.quantity,
      cost: item.radcoin_cost
    });
  };

  const groupedItems = storeItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, typeof storeItems>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-yellow-500" />
            Loja RadCoin
          </DialogTitle>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span>Saldo: {userBalance.toLocaleString()} RadCoins</span>
          </div>
        </DialogHeader>

        <div className="grid gap-6">
          {Object.entries(groupedItems).map(([type, items]) => (
            <div key={type} className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {getIcon(type)}
                {getTypeName(type)}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.map((item, index) => (
                  <Card key={index} className={`relative ${item.popular ? 'ring-2 ring-yellow-500' : ''}`}>
                    {item.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-yellow-500 text-black font-bold">
                          <Star className="h-3 w-3 mr-1" />
                          POPULAR
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${getTypeColor(type)} flex items-center justify-center text-white text-2xl`}>
                        {getIcon(type)}
                      </div>
                      <CardTitle className="text-lg">
                        {item.quantity}x {getTypeName(type)}
                      </CardTitle>
                      {item.bonus && (
                        <Badge variant="secondary" className="text-xs">
                          {item.bonus}
                        </Badge>
                      )}
                    </CardHeader>
                    
                    <CardContent className="text-center">
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                          <Coins className="h-5 w-5" />
                          {item.radcoin_cost.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          ~{Math.round(item.radcoin_cost / item.quantity)} RadCoins cada
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handlePurchase(item)}
                        disabled={isPurchasing || userBalance < item.radcoin_cost}
                        className="w-full"
                        variant={userBalance < item.radcoin_cost ? "destructive" : "default"}
                      >
                        {isPurchasing ? 'Comprando...' : 
                         userBalance < item.radcoin_cost ? 'Saldo Insuficiente' : 'Comprar'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Dica:</strong> Pacotes maiores oferecem melhor custo-benefício! 
            Use suas ajudas estrategicamente para maximizar seus pontos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
