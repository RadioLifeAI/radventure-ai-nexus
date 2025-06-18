
import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  BadgeCheck, 
  Star, 
  Target, 
  Brain, 
  Award,
  Zap,
  BookOpen,
  Heart,
  Microscope
} from "lucide-react";

export function CaseFormGamifiedHelpers({ form }: { form: any }) {
  // Sistema de badges mais avançado
  const badges = [];

  // Badges básicos
  if (form.ai_hint_enabled) {
    badges.push({ text: "IA Ativada", icon: <Lightbulb size={14} />, color: "purple", pulse: true });
  }

  // Badges de completude
  if (form.answer_feedbacks && form.answer_feedbacks.filter((x: string) => x?.length > 10).length === 4) {
    badges.push({ text: "Feedback Detalhado", icon: <BadgeCheck size={13} />, color: "blue" });
  }

  if (form.explanation && form.explanation.length > 100) {
    badges.push({ text: "Explicação Rica", icon: <BookOpen size={13} />, color: "green" });
  }

  // Badges de estrutura radiológica
  if (form.primary_diagnosis && form.anatomical_regions?.length > 0 && form.finding_types?.length > 0) {
    badges.push({ text: "Estrutura Radiológica", icon: <Microscope size={13} />, color: "cyan" });
  }

  // Badges de gamificação
  if (form.pathology_types?.length > 0 && form.learning_objectives?.length > 0) {
    badges.push({ text: "Educação Avançada", icon: <Brain size={13} />, color: "indigo" });
  }

  // Badge de qualidade premium
  const isHighQuality = form.primary_diagnosis && 
                       form.anatomical_regions?.length > 0 && 
                       form.pathology_types?.length > 0 && 
                       form.learning_objectives?.length > 0 &&
                       form.explanation?.length > 100;
  
  if (isHighQuality) {
    badges.push({ text: "Caso Premium", icon: <Star size={13} />, color: "yellow", special: true });
  }

  // Badge de caso raro
  if (form.case_rarity === "raro" || form.case_rarity === "muito_raro") {
    badges.push({ text: "Caso Raro", icon: <Award size={13} />, color: "purple" });
  }

  // Badge de emergência
  if (form.exam_context === "urgencia" || form.case_classification === "emergencial") {
    badges.push({ text: "Emergencial", icon: <Zap size={13} />, color: "red", pulse: true });
  }

  // Badge de alto valor educacional
  if (form.educational_value >= 8) {
    badges.push({ text: "Alto Valor Educacional", icon: <Target size={13} />, color: "green" });
  }

  // Badge de relevância clínica
  if (form.clinical_relevance >= 8) {
    badges.push({ text: "Alta Relevância", icon: <Heart size={13} />, color: "pink" });
  }

  // Badge de fonte Radiopaedia
  if (form.is_radiopaedia_case && form.reference_citation) {
    badges.push({ text: "Fonte Radiopaedia", icon: <BookOpen size={13} />, color: "orange" });
  }

  // Contador de conquistas
  const totalBadges = badges.length;
  const specialBadges = badges.filter(b => b.special).length;

  if (badges.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-1">
          <Award className="h-4 w-4" />
          Conquistas do Caso
        </h4>
        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs">
          {totalBadges} badge{totalBadges !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {badges.map((badge, idx) => (
          <Badge
            key={idx}
            className={`flex items-center gap-1 text-xs transition-all hover:scale-105 ${
              badge.special 
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse shadow-lg" 
                : badge.pulse
                ? `bg-${badge.color}-500 text-white animate-pulse`
                : `bg-${badge.color}-100 text-${badge.color}-700 border border-${badge.color}-300`
            }`}
          >
            {badge.icon}
            {badge.text}
            {badge.special && <Star size={10} className="ml-1" />}
          </Badge>
        ))}
      </div>

      {/* Motivação baseada no progresso */}
      {totalBadges >= 5 && (
        <div className="mt-2 p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded border border-green-200">
          <div className="text-xs font-medium text-green-800 flex items-center gap-1">
            <Star className="h-3 w-3" />
            Parabéns! Você está criando um caso de alta qualidade! 🎉
          </div>
        </div>
      )}

      {specialBadges > 0 && (
        <div className="mt-2 p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded border border-purple-200">
          <div className="text-xs font-medium text-purple-800 flex items-center gap-1">
            <Award className="h-3 w-3" />
            Caso Premium detectado! Este será um dos melhores da plataforma! ⭐
          </div>
        </div>
      )}
    </div>
  );
}
