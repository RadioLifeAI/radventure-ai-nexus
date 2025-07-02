
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, Award, Star } from "lucide-react";

interface CollaboratorBadgeProps {
  badge: string | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function CollaboratorBadge({ badge, size = "md", showLabel = true }: CollaboratorBadgeProps) {
  if (!badge || !badge.includes('Colaborador')) {
    return null;
  }

  const getBadgeConfig = (badgeText: string) => {
    if (badgeText.includes('Bronze')) {
      return {
        icon: Award,
        color: "bg-gradient-to-r from-orange-500 to-amber-600",
        textColor: "text-orange-900",
        label: "Colaborador Bronze",
        emoji: "🥉"
      };
    }
    if (badgeText.includes('Prata')) {
      return {
        icon: Star,
        color: "bg-gradient-to-r from-gray-400 to-slate-500",
        textColor: "text-slate-900",
        label: "Colaborador Prata",
        emoji: "🥈"
      };
    }
    if (badgeText.includes('Ouro')) {
      return {
        icon: Crown,
        color: "bg-gradient-to-r from-yellow-400 to-yellow-500",
        textColor: "text-yellow-900",
        label: "Colaborador Ouro",
        emoji: "🥇"
      };
    }
    return {
      icon: Award,
      color: "bg-gradient-to-r from-blue-500 to-purple-600",
      textColor: "text-blue-900",
      label: badge,
      emoji: "🏆"
    };
  };

  const config = getBadgeConfig(badge);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <Badge className={`${config.color} ${config.textColor} ${sizeClasses[size]} font-bold border-0 shadow-lg hover:scale-105 transition-all duration-300`}>
      <Icon className={`${iconSizes[size]} mr-1.5`} />
      {showLabel ? config.label : config.emoji}
    </Badge>
  );
}
