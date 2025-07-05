
import React from "react";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useResponsive } from "@/hooks/useResponsive";

interface ActionCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  link?: string;
  color: string;
  onClick?: () => void;
}

export function ActionCard({ icon, title, description, link, color, onClick }: ActionCardProps) {
  const { isMobile, isTablet } = useResponsive();
  
  const getButtonText = () => {
    switch (title) {
      case "Central de Casos": return "Explorar";
      case "Crie sua Jornada": return "Nova Jornada";
      case "Sistema de Conquistas": return "Ver Conquistas";
      default: return "Ver Eventos";
    }
  };

  return (
    <div className="bg-[#161f38] rounded-2xl shadow-lg flex flex-col items-center p-3 sm:p-4 md:p-6 min-h-[160px] sm:min-h-[180px] md:min-h-[200px] hover:scale-105 transition-transform duration-200 hover:shadow-xl group">
      <div className="mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-200">
        {React.cloneElement(icon, { size: isMobile ? 28 : isTablet ? 32 : 36, className: `${color}` })}
      </div>
      <span className="mt-1 sm:mt-2 text-base sm:text-lg md:text-xl font-extrabold text-white drop-shadow-sm text-center leading-tight px-1">
        {title}
      </span>
      <span className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-cyan-100 text-center leading-relaxed px-2 flex-1 line-clamp-3">
        {description}
      </span>
      
      {onClick ? (
        <Button
          onClick={onClick}
          variant="outline"
          className="mt-3 sm:mt-4 min-h-[40px] sm:min-h-[44px] border-none text-[#11d3fc] bg-white hover:bg-[#d1f6fd] font-bold px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow hover:shadow-lg transition-all duration-200 text-xs sm:text-sm md:text-base w-full max-w-[200px]"
        >
          <Activity size={14} className="mr-1 sm:mr-2 flex-shrink-0" />
          <span className="truncate">{getButtonText()}</span>
        </Button>
      ) : (
        <Button asChild variant="outline"
          className="mt-3 sm:mt-4 min-h-[40px] sm:min-h-[44px] border-none text-[#11d3fc] bg-white hover:bg-[#d1f6fd] font-bold px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow hover:shadow-lg transition-all duration-200 text-xs sm:text-sm md:text-base w-full max-w-[200px]"
        >
          <Link to={link || "#"}>
            <Activity size={14} className="mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">{getButtonText()}</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
