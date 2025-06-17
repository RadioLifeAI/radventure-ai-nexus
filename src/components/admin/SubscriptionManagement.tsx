
import React, { useState } from "react";
import { SubscriptionStats } from "./subscription/SubscriptionStats";
import { PlansTable } from "./subscription/PlansTable";
import { PlanForm } from "./subscription/PlanForm";
import { SubscriptionManagementHeader } from "./subscription/SubscriptionManagementHeader";

// Mock data para desenvolvimento
const mockStats = {
  totalSubscriptions: 385,
  activeSubscriptions: 342,
  monthlyRevenue: 28750.00,
  churnRate: 3.2
};

const mockPlans = [
  { id: '1', name: 'Básico', price: 29.90, features: ['Acesso básico', '50 casos/mês'] },
  { id: '2', name: 'Premium', price: 59.90, features: ['Acesso completo', 'Casos ilimitados', 'IA Tutor'] },
  { id: '3', name: 'Pro', price: 99.90, features: ['Tudo do Premium', 'Analytics', 'Suporte prioritário'] }
];

export function SubscriptionManagement() {
  const [plans, setPlans] = useState(mockPlans);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditPlan = (id: string) => {
    console.log('Editando plano:', id);
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  const handleSubmitPlan = (planData: any) => {
    console.log('Salvando plano:', planData);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleCancelPlan = () => {
    console.log('Cancelando edição de plano');
  };

  return (
    <div className="space-y-6">
      <SubscriptionManagementHeader 
        totalSubscriptions={mockStats.totalSubscriptions}
        activeSubscriptions={mockStats.activeSubscriptions}
        monthlyRevenue={mockStats.monthlyRevenue}
      />
      
      <div className="grid gap-6">
        <SubscriptionStats stats={mockStats} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlansTable 
            plans={plans}
            isLoading={isLoading}
            onEditPlan={handleEditPlan}
            onDeletePlan={handleDeletePlan}
          />
          <PlanForm 
            onSubmit={handleSubmitPlan}
            onCancel={handleCancelPlan}
          />
        </div>
      </div>
    </div>
  );
}
