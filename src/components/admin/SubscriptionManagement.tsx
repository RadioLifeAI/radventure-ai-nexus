
import React from "react";
import { SubscriptionStats } from "./subscription/SubscriptionStats";
import { PlansTable } from "./subscription/PlansTable";
import { PlanForm } from "./subscription/PlanForm";
import { SubscriptionManagementHeader } from "./subscription/SubscriptionManagementHeader";

export function SubscriptionManagement() {
  return (
    <div className="space-y-6">
      <SubscriptionManagementHeader 
        totalSubscriptions={0}
        activeSubscriptions={0}
        monthlyRevenue={0}
      />
      
      <div className="grid gap-6">
        <SubscriptionStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlansTable />
          <PlanForm />
        </div>
      </div>
    </div>
  );
}
