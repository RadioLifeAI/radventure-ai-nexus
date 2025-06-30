
import React from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportCaseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ReportCaseButton({ 
  onClick, 
  disabled = false, 
  variant = 'ghost',
  size = 'sm',
  className 
}: ReportCaseButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors",
        className
      )}
      title="Reportar problema com este caso"
    >
      <Flag className="h-4 w-4" />
      <span className="text-xs">Report</span>
    </Button>
  );
}
