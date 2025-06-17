
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface AdminFormLayoutGamifiedProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon: LucideIcon;
  category: "analytics" | "users" | "events" | "cases" | "monitoring" | "rewards" | "settings";
  progress?: number;
  badge?: string;
}

export function AdminFormLayoutGamified({ 
  children, 
  title, 
  description, 
  icon: Icon, 
  category, 
  progress, 
  badge 
}: AdminFormLayoutGamifiedProps) {
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "analytics":
        return {
          gradient: "from-blue-50 to-indigo-50",
          border: "border-blue-200",
          iconColor: "text-blue-500",
          titleColor: "text-blue-800",
          badgeColor: "bg-blue-500",
          progressColor: "bg-blue-500"
        };
      case "users":
        return {
          gradient: "from-green-50 to-emerald-50",
          border: "border-green-200",
          iconColor: "text-green-500",
          titleColor: "text-green-800",
          badgeColor: "bg-green-500",
          progressColor: "bg-green-500"
        };
      case "events":
        return {
          gradient: "from-purple-50 to-pink-50",
          border: "border-purple-200",
          iconColor: "text-purple-500",
          titleColor: "text-purple-800",
          badgeColor: "bg-purple-500",
          progressColor: "bg-purple-500"
        };
      case "cases":
        return {
          gradient: "from-cyan-50 to-blue-50",
          border: "border-cyan-200",
          iconColor: "text-cyan-500",
          titleColor: "text-cyan-800",
          badgeColor: "bg-cyan-500",
          progressColor: "bg-cyan-500"
        };
      case "monitoring":
        return {
          gradient: "from-red-50 to-orange-50",
          border: "border-red-200",
          iconColor: "text-red-500",
          titleColor: "text-red-800",
          badgeColor: "bg-red-500",
          progressColor: "bg-red-500"
        };
      case "rewards":
        return {
          gradient: "from-yellow-50 to-amber-50",
          border: "border-yellow-200",
          iconColor: "text-yellow-500",
          titleColor: "text-yellow-800",
          badgeColor: "bg-yellow-500",
          progressColor: "bg-yellow-500"
        };
      case "settings":
        return {
          gradient: "from-gray-50 to-slate-50",
          border: "border-gray-200",
          iconColor: "text-gray-500",
          titleColor: "text-gray-800",
          badgeColor: "bg-gray-500",
          progressColor: "bg-gray-500"
        };
      default:
        return {
          gradient: "from-gray-50 to-slate-50",
          border: "border-gray-200",
          iconColor: "text-gray-500",
          titleColor: "text-gray-800",
          badgeColor: "bg-gray-500",
          progressColor: "bg-gray-500"
        };
    }
  };

  const config = getCategoryConfig(category);

  return (
    <Card className={`border-2 ${config.border} bg-gradient-to-br ${config.gradient} shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in`}>
      <CardHeader className="pb-4">
        <CardTitle className={`flex items-center gap-3 ${config.titleColor}`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
          {title}
          {badge && (
            <Badge className={`${config.badgeColor} text-white`}>{badge}</Badge>
          )}
          {progress !== undefined && (
            <div className="ml-auto">
              <div className={`w-20 h-2 bg-gray-200 rounded-full overflow-hidden`}>
                <div 
                  className={`h-full ${config.progressColor} transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardTitle>
        {description && (
          <p className={`text-sm ${config.titleColor.replace('800', '600')} mt-1`}>
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}
