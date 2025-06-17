
import React from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { CasesCentral } from "@/components/cases/CasesCentral";

export default function Casos() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      
      <main className="container mx-auto px-4 py-8">
        <CasesCentral />
      </main>
    </div>
  );
}
