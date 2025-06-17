
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Crown } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  features: any;
  limits: any;
  is_active: boolean;
}

interface PlansTableIntegratedProps {
  plans: Plan[];
  isLoading: boolean;
  onEditPlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
}

export function PlansTableIntegrated({ plans, isLoading, onEditPlan, onDeletePlan }: PlansTableIntegratedProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('free')) return '🆓';
    if (planName.toLowerCase().includes('pro')) return '⭐';
    if (planName.toLowerCase().includes('plus')) return '👑';
    return '📦';
  };

  const getPlanColor = (planName: string) => {
    if (planName.toLowerCase().includes('free')) return 'bg-gray-100 text-gray-800';
    if (planName.toLowerCase().includes('pro')) return 'bg-blue-100 text-blue-800';
    if (planName.toLowerCase().includes('plus')) return 'bg-purple-100 text-purple-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Crown className="h-5 w-5" />
          Planos de Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {plans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Crown className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Nenhum plano encontrado</p>
            </div>
          ) : (
            plans.map((plan) => (
              <div 
                key={plan.id} 
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getPlanIcon(plan.name)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{plan.display_name}</h3>
                      <Badge className={getPlanColor(plan.name)}>
                        {plan.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-lg font-bold text-purple-600">
                        {formatCurrency(plan.price_monthly)}/mês
                      </span>
                      {plan.price_yearly > 0 && (
                        <span className="text-sm text-gray-500">
                          {formatCurrency(plan.price_yearly)}/ano
                        </span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditPlan(plan.id)}
                    className="hover:bg-blue-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeletePlan(plan.id)}
                    className="hover:bg-red-50 text-red-600"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
