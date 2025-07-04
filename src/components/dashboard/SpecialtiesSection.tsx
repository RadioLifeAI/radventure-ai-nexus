
import React from "react";
import { Brain, Stethoscope } from "lucide-react";
import { SpecialtyCard } from "./SpecialtyCard";

interface SpecialtiesSectionProps {
  specialties: any[];
  specialtiesWithProgress: any[];
}

export function SpecialtiesSection({ specialties, specialtiesWithProgress }: SpecialtiesSectionProps) {
  // Separar especialidades por tipo
  const imagingSpecialties = specialties.filter(spec => 
    spec.name.includes('Radiologia') || 
    spec.name.includes('Neurorradiologia') ||
    spec.name.includes('Imagem')
  );

  const medicalSpecialties = specialties.filter(spec => 
    !imagingSpecialties.some(img => img.name === spec.name)
  );

  return (
    <>
      {/* Diagnóstico por Imagem */}
      {imagingSpecialties.length > 0 && (
        <section className="w-full mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-xl sm:text-2xl text-white flex items-center gap-2">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-300" />
              Diagnóstico por Imagem
            </h2>
            <div className="text-sm text-cyan-200 flex items-center gap-2">
              <span className="bg-cyan-500/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {imagingSpecialties.reduce((sum, spec) => sum + spec.cases, 0)} casos disponíveis
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {imagingSpecialties.map((specialty) => (
              <SpecialtyCard 
                key={specialty.id || specialty.name} 
                specialty={specialtiesWithProgress.find(s => s.name === specialty.name) || specialty} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Especialidades Médicas */}
      {medicalSpecialties.length > 0 && (
        <section className="w-full mt-8 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-xl sm:text-2xl text-white flex items-center gap-2">
              <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-300" />
              Especialidades Médicas
            </h2>
            <div className="text-sm text-cyan-200 flex items-center gap-2">
              <span className="bg-cyan-500/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {medicalSpecialties.reduce((sum, spec) => sum + spec.cases, 0)} casos disponíveis
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {medicalSpecialties.map((specialty) => (
              <SpecialtyCard 
                key={specialty.id || specialty.name} 
                specialty={specialtiesWithProgress.find(s => s.name === specialty.name) || specialty} 
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
