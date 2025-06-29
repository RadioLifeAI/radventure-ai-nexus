
import React from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { CasesCentralAdvanced } from "@/components/cases/CasesCentralAdvanced";

export default function Casos() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      
      <main className="flex-1 w-full px-2 sm:px-4 lg:px-8 xl:px-16 py-4 sm:py-8 overflow-x-hidden">
        <div className="w-full">
          <CasesCentralAdvanced />
        </div>
      </main>
    </div>
  );
}
