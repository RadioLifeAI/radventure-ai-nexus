
import React from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen w-full flex">
      <AdminSidebar />
      <main className="flex-1 ml-[235px] p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
