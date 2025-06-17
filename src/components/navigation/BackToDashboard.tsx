
import React from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface BackToDashboardProps {
  className?: string;
  variant?: "home" | "back";
  showText?: boolean;
}

export function BackToDashboard({ 
  className = "", 
  variant = "home",
  showText = true 
}: BackToDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    // Detectar se estamos em contexto admin ou app
    if (location.pathname.startsWith('/admin')) {
      navigate('/admin/analytics');
    } else {
      navigate('/app/dashboard');
    }
  };

  const getDashboardLabel = () => {
    if (location.pathname.startsWith('/admin')) {
      return variant === "home" ? "Admin Dashboard" : "Voltar ao Admin Dashboard";
    }
    return variant === "home" ? "Dashboard" : "Voltar ao Dashboard";
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors ${className}`}
    >
      {variant === "home" ? (
        <Home className="h-4 w-4" />
      ) : (
        <ArrowLeft className="h-4 w-4" />
      )}
      {showText && (
        <span>{getDashboardLabel()}</span>
      )}
    </Button>
  );
}
