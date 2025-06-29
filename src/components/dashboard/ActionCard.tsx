
import React from "react";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ActionCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  link?: string;
  color: string;
  onClick?: () => void;
}

export function ActionCard({ icon, title, description, link, color, onClick }: ActionCardProps) {
  const getButtonText = () => {
    switch (title) {
      case "Central de Casos": return "Explorar";
      case "Crie sua Jornada": return "Nova Jornada";
      case "Sistema de Conquistas": return "Ver Conquistas";
      default: return "Ver Eventos";
    }
  };

  return (
    <div className="bg-[#161f38] rounded-2xl shadow-lg flex flex-col items-center p-4 sm:p-6 min-h-[160px] sm:min-h-[186px] hover:scale-105 transition-transform duration-200 hover:shadow-xl group">
      <div className="mb-2 group-hover:scale-110 transition-transform duration-200">
        {React.cloneElement(icon, { size: 32, className: `sm:size-9 ${color}` })}
      </div>
      <span className="mt-2 text-base sm:text-lg font-extrabold text-white drop-shadow-sm text-center leading-tight">
        {title}
      </span>
      <span className="mt-1 text-xs sm:text-sm text-cyan-100 text-center leading-relaxed px-1">
        {description}
      </span>
      
      {onClick ? (
        <Button
          onClick={onClick}
          size="sm"
          variant="outline"
          className="mt-3 sm:mt-4 border-none text-[#11d3fc] bg-white hover:bg-[#d1f6fd] font-bold px-3 sm:px-4 rounded-xl shadow hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
        >
          <Activity size={12} className="sm:size-4 mr-1" />
          {getButtonText()}
        </Button>
      ) : (
        <Button asChild size="sm" variant="outline"
          className="mt-3 sm:mt-4 border-none text-[#11d3fc] bg-white hover:bg-[#d1f6fd] font-bold px-3 sm:px-4 rounded-xl shadow hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
        >
          <Link to={link || "#"}>
            <Activity size={12} className="sm:size-4 mr-1" />
            {getButtonText()}
          </Link>
        </Button>
      )}
    </div>
  );
}
