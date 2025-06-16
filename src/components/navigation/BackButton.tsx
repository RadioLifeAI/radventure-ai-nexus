
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function BackButton({ 
  to, 
  label = "Voltar", 
  className = "",
  variant = "ghost"
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleBack}
      className={`text-cyan-300 hover:text-cyan-100 hover:bg-cyan-900/30 transition-colors ${className}`}
    >
      <ArrowLeft size={16} className="mr-2" />
      {label}
    </Button>
  );
}
