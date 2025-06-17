
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

interface PlansTableProps {
  plans: Plan[];
  isLoading: boolean;
  onEditPlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
}

export function PlansTable({ plans, isLoading, onEditPlan, onDeletePlan }: PlansTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Planos Ativos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-sm text-gray-600">R$ {plan.price.toFixed(2)}/mês</p>
                <ul className="text-xs text-gray-500 mt-1">
                  {plan.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEditPlan(plan.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDeletePlan(plan.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
