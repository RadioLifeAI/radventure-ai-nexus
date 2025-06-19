
import React from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ExecutiveDashboard } from "./components/ExecutiveDashboard";

export default function AdminDashboardAdvanced() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <ExecutiveDashboard />
      </main>
    </div>
  );
}
