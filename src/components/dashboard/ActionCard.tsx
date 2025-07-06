
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
  const { isMobile, isTablet, getResponsiveText, getResponsiveButton } = useResponsive();
  
  const getButtonText = () => {
    switch (title) {
      case "Central de Casos": return isMobile ? "Explorar" : "Explorar Casos";
      case "Crie sua Jornada": return isMobile ? "Criar" : "Nova Jornada";
      case "Sistema de Conquistas": return isMobile ? "Conquistas" : "Ver Conquistas";
      default: return isMobile ? "Eventos" : "Ver Eventos";
    }
  };

  return (
    <div className="bg-[#161f38] rounded-2xl shadow-lg flex flex-col items-center p-4 sm:p-5 lg:p-6 min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] hover:scale-105 transition-transform duration-200 hover:shadow-xl group">
      <div className="mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">
        {React.cloneElement(icon, { 
          size: isMobile ? 32 : isTablet ? 36 : 40, 
          className: `${color} flex-shrink-0` 
        })}
      </div>
      <h3 className={`${getResponsiveText('base')} font-extrabold text-white drop-shadow-sm text-center leading-tight px-1 mb-2`}>
        {title}
      </h3>
      <p className={`${getResponsiveText('xs')} text-cyan-100 text-center leading-relaxed px-2 flex-1 line-clamp-3 mb-4`}>
        {description}
      </p>
      
      {onClick ? (
        <Button
          onClick={onClick}
          variant="outline"
          className={`${getResponsiveButton()} border-none text-[#11d3fc] bg-white hover:bg-[#d1f6fd] font-bold rounded-xl shadow hover:shadow-lg transition-all duration-200 w-full max-w-[180px] sm:max-w-[200px] min-h-[44px] px-4 py-3 touch-target flex items-center justify-center`}
        >
          <Activity size={16} className="mr-2 flex-shrink-0" />
          <span className="truncate leading-tight">{getButtonText()}</span>
        </Button>
      ) : (
        <Button asChild variant="outline"
          className={`${getResponsiveButton()} border-none text-[#11d3fc] bg-white hover:bg-[#d1f6fd] font-bold rounded-xl shadow hover:shadow-lg transition-all duration-200 w-full max-w-[180px] sm:max-w-[200px] min-h-[44px] px-4 py-3 touch-target flex items-center justify-center`}
        >
          <Link to={link || "#"} className="flex items-center justify-center w-full">
            <Activity size={16} className="mr-2 flex-shrink-0" />
            <span className="truncate leading-tight">{getButtonText()}</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
