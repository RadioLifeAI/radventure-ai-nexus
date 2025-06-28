
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Eye, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewModeBadgeProps {
  isReview: boolean;
  reviewCount: number;
  previousPoints?: number | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ReviewModeBadge({ 
  isReview, 
  reviewCount, 
  previousPoints, 
  className,
  size = 'md'
}: ReviewModeBadgeProps) {
  if (!isReview) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant="secondary" 
        className={cn(
          "bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1",
          sizeClasses[size]
        )}
      >
        <Eye className="h-3 w-3" />
        Modo Revisão
      </Badge>
      
      {reviewCount > 0 && (
        <Badge 
          variant="outline" 
          className={cn(
            "bg-gray-50 text-gray-700 border-gray-300 flex items-center gap-1",
            sizeClasses[size]
          )}
        >
          <RotateCcw className="h-3 w-3" />
          {reviewCount}ª tentativa
        </Badge>
      )}
      
      {previousPoints !== null && previousPoints > 0 && (
        <Badge 
          variant="outline" 
          className={cn(
            "bg-green-50 text-green-700 border-green-300 flex items-center gap-1",
            sizeClasses[size]
          )}
        >
          <Award className="h-3 w-3" />
          {previousPoints} pts ganhos
        </Badge>
      )}
    </div>
  );
}
