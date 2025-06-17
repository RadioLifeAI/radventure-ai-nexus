
import React from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { JourneyCreator } from "@/components/journey/JourneyCreator";

export default function CreateJourney() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <HeaderNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Jornada de Aprendizado</h1>
          <p className="text-gray-600">
            Use IA para criar uma trilha de aprendizado personalizada baseada em seus objetivos
          </p>
        </div>
        
        <JourneyCreator />
      </main>
    </div>
  );
}
