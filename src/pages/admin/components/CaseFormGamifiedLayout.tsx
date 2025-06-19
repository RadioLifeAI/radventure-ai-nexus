
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
      case "basic":
        return {
          icon: Target,
          color: "blue",
          gradient: "from-blue-50 to-indigo-50",
          border: "border-blue-200",
          badge: "Essencial"
        };
      case "clinical":
        return {
          icon: Brain,
          color: "green",
          gradient: "from-green-50 to-emerald-50",
          border: "border-green-200",
          badge: "Clínico"
        };
      case "quiz":
        return {
          icon: Lightbulb,
          color: "yellow",
          gradient: "from-yellow-50 to-orange-50",
          border: "border-yellow-200",
          badge: "Quiz"
        };
      case "advanced":
        return {
          icon: Settings,
          color: "purple",
          gradient: "from-purple-50 to-pink-50",
          border: "border-purple-200",
          badge: "Avançado"
        };
      case "gamification":
        return {
          icon: Trophy,
          color: "amber",
          gradient: "from-amber-50 to-yellow-50",
          border: "border-amber-200",
          badge: "Gamificação"
        };
      case "structured":
        return {
          icon: Database,
          color: "cyan",
          gradient: "from-cyan-50 to-blue-50",
          border: "border-cyan-200",
          badge: "Estruturado"
        };
      case "reference":
        return {
          icon: BookOpen,
          color: "indigo",
          gradient: "from-indigo-50 to-purple-50",
          border: "border-indigo-200",
          badge: "Referência"
        };
      case "images":
        return {
          icon: Images,
          color: "emerald",
          gradient: "from-emerald-50 to-teal-50",
          border: "border-emerald-200",
          badge: "Imagens"
        };
      default:
        return {
          icon: Target,
          color: "gray",
          gradient: "from-gray-50 to-slate-50",
          border: "border-gray-200",
          badge: "Seção"
        };
    }
  };

  const config = getSectionConfig(section);
  const Icon = config.icon;

  return (
    <Card className={`border-2 ${config.border} bg-gradient-to-br ${config.gradient} shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in`}>
      <CardHeader className="pb-4">
        <CardTitle className={`flex items-center gap-2 text-${config.color}-800`}>
          <Icon className={`h-5 w-5 text-${config.color}-500`} />
          {title}
          <Badge className={`bg-${config.color}-500 text-white`}>{config.badge}</Badge>
          {progress !== undefined && (
            <div className="ml-auto">
              <div className={`w-16 h-2 bg-${config.color}-200 rounded-full overflow-hidden`}>
                <div 
                  className={`h-full bg-${config.color}-500 transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardTitle>
        {description && (
          <p className={`text-sm text-${config.color}-600 mt-1`}>
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}
