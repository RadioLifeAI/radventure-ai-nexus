
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { UserPerformanceCard } from "./UserPerformanceCard";

export function EventosAnalytics() {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Analytics Avançado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <PerformanceMetrics />
          <UserPerformanceCard />
        </div>
      </CardContent>
    </Card>
  );
}
