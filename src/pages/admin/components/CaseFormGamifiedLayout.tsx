
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Lightbulb, Settings, Users, Trophy, Database, BookOpen, Images } from "lucide-react";

interface CaseFormGamifiedLayoutProps {
  children: React.ReactNode;
  section: "basic" | "clinical" | "quiz" | "advanced" | "gamification" | "structured" | "reference" | "images";
  title: string;
  description?: string;
  progress?: number;
}

export function CaseFormGamifiedLayout({ 
  children, 
  section, 
  title, 
  description, 
  progress 
}: CaseFormGamifiedLayoutProps) {
  const getSectionConfig = (section: string) => {
    switch (section) {
      case "structured":
        return {
          icon: Database,
          color: "cyan",
          gradient: "from-cyan-50 via-blue-50 to-indigo-50",
          border: "border-cyan-300",
          badge: "Estruturado",
          headerGradient: "from-cyan-100 to-blue-100"
        };
      case "basic":
        return {
          icon: Target,
          color: "blue",
          gradient: "from-blue-50 via-indigo-50 to-purple-50",
          border: "border-blue-300",
          badge: "Essencial",
          headerGradient: "from-blue-100 to-indigo-100"
        };
      case "images":
        return {
          icon: Images,
          color: "purple",
          gradient: "from-purple-50 via-pink-50 to-rose-50",
          border: "border-purple-300",
          badge: "Imagens",
          headerGradient: "from-purple-100 to-pink-100"
        };
      case "quiz":
        return {
          icon: Lightbulb,
          color: "yellow",
          gradient: "from-yellow-50 via-orange-50 to-red-50",
          border: "border-yellow-300",
          badge: "Quiz",
          headerGradient: "from-yellow-100 to-orange-100"
        };
      case "clinical":
        return {
          icon: Brain,
          color: "green",
          gradient: "from-green-50 via-emerald-50 to-teal-50",
          border: "border-green-300",
          badge: "Clínico",
          headerGradient: "from-green-100 to-emerald-100"
        };
      case "advanced":
        return {
          icon: Settings,
          color: "gray",
          gradient: "from-gray-50 via-slate-50 to-zinc-50",
          border: "border-gray-300",
          badge: "Avançado",
          headerGradient: "from-gray-100 to-slate-100"
        };
      case "gamification":
        return {
          icon: Trophy,
          color: "amber",
          gradient: "from-amber-50 via-yellow-50 to-orange-50",
          border: "border-amber-300",
          badge: "Gamificação",
          headerGradient: "from-amber-100 to-yellow-100"
        };
      case "reference":
        return {
          icon: BookOpen,
          color: "indigo",
          gradient: "from-indigo-50 via-purple-50 to-pink-50",
          border: "border-indigo-300",
          badge: "Referência",
          headerGradient: "from-indigo-100 to-purple-100"
        };
      default:
        return {
          icon: Target,
          color: "gray",
          gradient: "from-gray-50 via-slate-50 to-zinc-50",
          border: "border-gray-300",
          badge: "Seção",
          headerGradient: "from-gray-100 to-slate-100"
        };
    }
  };

  const config = getSectionConfig(section);
  const Icon = config.icon;

  return (
    <Card className={`border-2 ${config.border} bg-gradient-to-br ${config.gradient} shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] animate-fade-in`}>
      <CardHeader className={`pb-4 bg-gradient-to-r ${config.headerGradient} rounded-t-lg border-b border-opacity-30 ${config.border}`}>
        <CardTitle className={`flex items-center gap-3 text-${config.color}-900`}>
          <div className={`p-2 bg-${config.color}-200 rounded-lg shadow-md`}>
            <Icon className={`h-5 w-5 text-${config.color}-700`} />
          </div>
          <span className="font-bold">{title}</span>
          <Badge className={`bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 text-white shadow-md hover:shadow-lg transition-shadow duration-300`}>
            {config.badge}
          </Badge>
          {progress !== undefined && (
            <div className="ml-auto">
              <div className={`w-20 h-3 bg-${config.color}-200 rounded-full overflow-hidden shadow-inner`}>
                <div 
                  className={`h-full bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 transition-all duration-700 ease-out`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardTitle>
        {description && (
          <p className={`text-sm text-${config.color}-700 mt-2 font-medium`}>
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        {children}
      </CardContent>
    </Card>
  );
}
