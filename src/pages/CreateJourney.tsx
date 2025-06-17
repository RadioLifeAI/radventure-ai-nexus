
import React from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { JourneyCreator } from "@/components/journey/JourneyCreator";

export default function CreateJourney() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <HeaderNav />
      
      <main className="container mx-auto px-4 py-8">
        <JourneyCreator />
      </main>
    </div>
  );
}
