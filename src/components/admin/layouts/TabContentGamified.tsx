
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface TabContentGamifiedProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon: LucideIcon;
  category: "analytics" | "users" | "events" | "cases" | "monitoring" | "rewards" | "settings";
  badge?: string;
  stats?: { label: string; value: string | number }[];
}

export function TabContentGamified({ 
  children, 
  title, 
  description, 
  icon: Icon, 
  category, 
  badge, 
  stats 
}: TabContentGamifiedProps) {
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "analytics":
        return {
          gradient: "from-blue-50 to-indigo-50",
          headerGradient: "from-blue-100 to-indigo-100",
          border: "border-blue-200",
          iconColor: "text-blue-600",
          titleColor: "text-blue-900",
          badgeColor: "bg-blue-500"
        };
      case "users":
        return {
          gradient: "from-green-50 to-emerald-50",
          headerGradient: "from-green-100 to-emerald-100",
          border: "border-green-200",
          iconColor: "text-green-600",
          titleColor: "text-green-900",
          badgeColor: "bg-green-500"
        };
      case "events":
        return {
          gradient: "from-purple-50 to-pink-50",
          headerGradient: "from-purple-100 to-pink-100",
          border: "border-purple-200",
          iconColor: "text-purple-600",
          titleColor: "text-purple-900",
          badgeColor: "bg-purple-500"
        };
      case "cases":
        return {
          gradient: "from-cyan-50 to-blue-50",
          headerGradient: "from-cyan-100 to-blue-100",
          border: "border-cyan-200",
          iconColor: "text-cyan-600",
          titleColor: "text-cyan-900",
          badgeColor: "bg-cyan-500"
        };
      case "monitoring":
        return {
          gradient: "from-red-50 to-orange-50",
          headerGradient: "from-red-100 to-orange-100",
          border: "border-red-200",
          iconColor: "text-red-600",
          titleColor: "text-red-900",
          badgeColor: "bg-red-500"
        };
      case "rewards":
        return {
          gradient: "from-yellow-50 to-amber-50",
          headerGradient: "from-yellow-100 to-amber-100",
          border: "border-yellow-200",
          iconColor: "text-yellow-600",
          titleColor: "text-yellow-900",
          badgeColor: "bg-yellow-500"
        };
      case "settings":
        return {
          gradient: "from-gray-50 to-slate-50",
          headerGradient: "from-gray-100 to-slate-100",
          border: "border-gray-200",
          iconColor: "text-gray-600",
          titleColor: "text-gray-900",
          badgeColor: "bg-gray-500"
        };
      default:
        return {
          gradient: "from-gray-50 to-slate-50",
          headerGradient: "from-gray-100 to-slate-100",
          border: "border-gray-200",
          iconColor: "text-gray-600",
          titleColor: "text-gray-900",
          badgeColor: "bg-gray-500"
        };
    }
  };

  const config = getCategoryConfig(category);

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br ${config.gradient} animate-fade-in`}>
      <CardHeader className={`bg-gradient-to-r ${config.headerGradient} rounded-t-lg ${config.border} border-b`}>
        <CardTitle className={`flex items-center gap-3 ${config.titleColor}`}>
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
          {title}
          {badge && (
            <Badge className={`${config.badgeColor} text-white`}>{badge}</Badge>
          )}
        </CardTitle>
        {description && (
          <p className={`text-sm ${config.titleColor.replace('900', '700')} mt-1`}>
            {description}
          </p>
        )}
        {stats && (
          <div className="flex gap-4 mt-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-lg font-bold ${config.titleColor}`}>{stat.value}</div>
                <div className={`text-xs ${config.titleColor.replace('900', '600')}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
}
