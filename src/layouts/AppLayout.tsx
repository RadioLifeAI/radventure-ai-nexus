
import React from "react";
import { Outlet } from "react-router-dom";
import { HeaderNav } from "@/components/HeaderNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen w-full">
      <HeaderNav />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}
