
import React from "react";
import { Sparkles, Brain, Stethoscope, GraduationCap, Gamepad2, MessageSquareQuestion, Settings, Database } from "lucide-react";

interface CaseFormGamifiedLayoutProps {
  section: string;
  title: string;
  description: string;
  children: React.ReactNode;
  aiComponent?: React.ReactNode;
}

export function CaseFormGamifiedLayout({ 
  section, 
  title, 
  description, 
  children, 
  aiComponent 
}: CaseFormGamifiedLayoutProps) {
  const getSectionIcon = (section: string) => {
    switch (section) {
      case "basic": return <Database className="h-5 w-5" />;
      case "structured": return <Brain className="h-5 w-5" />;
      case "clinical": return <Stethoscope className="h-5 w-5" />;
      case "educational": return <GraduationCap className="h-5 w-5" />;
      case "gamification": return <Gamepad2 className="h-5 w-5" />;
      case "quiz": return <MessageSquareQuestion className="h-5 w-5" />;
      case "advanced": return <Settings className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getSectionColors = (section: string) => {
    switch (section) {
      case "basic": return "from-blue-50 to-indigo-50 border-blue-200";
      case "structured": return "from-purple-50 to-violet-50 border-purple-200";
      case "clinical": return "from-green-50 to-emerald-50 border-green-200";
      case "educational": return "from-orange-50 to-amber-50 border-orange-200";
      case "gamification": return "from-red-50 to-pink-50 border-red-200";
      case "quiz": return "from-teal-50 to-cyan-50 border-teal-200";
      case "advanced": return "from-gray-50 to-slate-50 border-gray-200";
      default: return "from-blue-50 to-indigo-50 border-blue-200";
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getSectionColors(section)} rounded-lg border-2 p-6 space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getSectionIcon(section)}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {aiComponent && (
          <div className="flex-shrink-0">
            {aiComponent}
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {children}
      </div>
    </div>
  );
}
