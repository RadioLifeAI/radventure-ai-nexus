
import React from "react";
import { CreditCard, Sparkles, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SubscriptionManagementHeaderProps {
  totalSubscriptions?: number;
  activeSubscriptions?: number;
  monthlyRevenue?: number;
}

export function SubscriptionManagementHeader({ 
  totalSubscriptions = 0, 
  activeSubscriptions = 0, 
  monthlyRevenue = 0 
}: SubscriptionManagementHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white mb-6">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative px-8 py-12">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
            <CreditCard className="h-8 w-8 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              Gestão de Assinaturas
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </h1>
            <p className="text-emerald-100 text-lg">
              Gerencie planos, assinaturas e receita da plataforma
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge className="bg-green-500/80 text-white px-3 py-1">
                <Star className="h-4 w-4 mr-1" />
                {totalSubscriptions} assinaturas
              </Badge>
              <Badge className="bg-emerald-500/80 text-white px-3 py-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {activeSubscriptions} ativas
              </Badge>
              <Badge className="bg-teal-500/80 text-white px-3 py-1">
                <CreditCard className="h-4 w-4 mr-1" />
                R$ {monthlyRevenue.toLocaleString()}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
