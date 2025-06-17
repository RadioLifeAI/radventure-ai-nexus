
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getSpecialtyData } from "@/data/specialtyIcons";
import { Sparkles, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SpecialtyCardProps {
  specialty: {
    id?: number;
    name: string;
    cases: number;
  };
}

export function SpecialtyCard({ specialty }: SpecialtyCardProps) {
  const navigate = useNavigate();
  const specialtyData = getSpecialtyData(specialty.name);

  // Buscar primeiro caso da especialidade
  const { data: firstCase } = useQuery({
    queryKey: ['first-case', specialty.name],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_cases')
        .select('id')
        .eq('specialty', specialty.name)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: specialty.cases > 0
  });

  const handleClick = () => {
    if (specialty.cases > 0 && firstCase) {
      // Ir direto para resolução do primeiro caso
      navigate(`/caso/${firstCase.id}?fromSpecialty=${encodeURIComponent(specialty.name)}`);
    } else {
      // Se não há casos, ir para central de casos com filtro
      navigate(`/central-casos?specialty=${encodeURIComponent(specialty.name)}`);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl ${specialtyData.gradient} ${specialtyData.borderColor} border-2 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-1`}
      onClick={handleClick}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      
      {/* Sparkle effect on hover */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles className="h-4 w-4 text-yellow-500" />
      </div>

      <div className="relative p-6 flex flex-col h-full min-h-[160px]">
        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-md group-hover:scale-110 transition-transform duration-300">
            {specialtyData.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1 group-hover:text-gray-900 transition-colors">
              {specialty.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {specialtyData.description}
            </p>
          </div>
        </div>

        {/* Stats and Action */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="bg-white/60 backdrop-blur-sm text-gray-700 font-semibold"
            >
              {specialty.cases} caso{specialty.cases !== 1 ? 's' : ''}
            </Badge>
            {specialty.cases > 0 ? (
              <Badge 
                variant="outline" 
                className="border-green-300 text-green-700 bg-green-50/80"
              >
                Disponível
              </Badge>
            ) : (
              <Badge 
                variant="outline" 
                className="border-gray-300 text-gray-500 bg-gray-50/80"
              >
                Em breve
              </Badge>
            )}
          </div>

          <Button 
            size="sm" 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105"
          >
            <span className="mr-2">
              {specialty.cases > 0 ? 'Resolver' : 'Explorar'}
            </span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
}
