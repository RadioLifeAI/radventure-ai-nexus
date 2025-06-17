
import React from "react";
import { RewardTabs } from "./reward/RewardTabs";
import { RewardManagementHeader } from "./reward/RewardManagementHeader";

export function RewardManagement() {
  return (
    <div className="space-y-6">
      <RewardManagementHeader />
      <RewardTabs />
    </div>
  );
}
