
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Target, BookOpen, Trophy, MessageSquareQuote, Lightbulb, Settings, Wand2 } from "lucide-react";

interface AIButtonProps {
  onClick: () => void;
  loading: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export function AIButton({ onClick, loading, icon: Icon, label, description, variant = "outline", className = "" }: AIButtonProps) {
  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant={variant}
        size="sm"
        onClick={onClick}
        disabled={loading}
        className={`flex items-center gap-2 ${className}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        {label}
      </Button>
      <span className="text-xs text-gray-500">{description}</span>
    </div>
  );
}

// Componentes especializados para cada seção

export function AIStructuredDataButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <AIButton
      onClick={onClick}
      loading={loading}
      icon={Target}
      label="🎯 AI: Diagnósticos"
      description="Preenche diagnósticos, classificação, regiões anatômicas"
      variant="outline"
      className="border-cyan-300 text-cyan-700 hover:bg-cyan-50"
    />
  );
}

export function AIClinicalSummaryButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <AIButton
      onClick={onClick}
      loading={loading}
      icon={Brain}
      label="🧠 AI: Resumo Clínico"
      description="Gera sintomas, sinais vitais, histórico médico"
      variant="outline"
      className="border-green-300 text-green-700 hover:bg-green-50"
    />
  );
}

export function AIEducationalTagsButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <AIButton
      onClick={onClick}
      loading={loading}
      icon={BookOpen}
      label="📚 AI: Tags Educacionais"
      description="Objetivos, palavras-chave, metadados educacionais"
      variant="outline"
      className="border-blue-300 text-blue-700 hover:bg-blue-50"
    />
  );
}

export function AIGamificationButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <AIButton
      onClick={onClick}
      loading={loading}
      icon={Trophy}
      label="🏆 AI: Métricas Inteligentes"
      description="Raridade, valor educacional, tempo estimado"
      variant="outline"
      className="border-amber-300 text-amber-700 hover:bg-amber-50"
    />
  );
}

export function AIQuizCompleteButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <AIButton
      onClick={onClick}
      loading={loading}
      icon={MessageSquareQuote}
      label="❓ AI: Quiz Completo"
      description="Pergunta, alternativas, feedbacks e dicas"
      variant="outline"
      className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
    />
  );
}

export function AIExplanationFeedbackButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <AIButton
      onClick={onClick}
      loading={loading}
      icon={Lightbulb}
      label="💡 AI: Explicação Total"
      description="Explicação detalhada e dica estratégica"
      variant="outline"
      className="border-purple-300 text-purple-700 hover:bg-purple-50"
    />
  );
}

export function AIAdvancedConfigButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <AIButton
      onClick={onClick}
      loading={loading}
      icon={Settings}
      label="⚙️ AI: Config Inteligente"
      description="Ajustes automáticos de dificuldade e gamificação"
      variant="outline"
      className="border-gray-300 text-gray-700 hover:bg-gray-50"
    />
  );
}

export function AIMasterAutofillButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <AIButton
      onClick={onClick}
      loading={loading}
      icon={Wand2}
      label="🪄 AI: Preencher TUDO"
      description="Auto-preenchimento completo do formulário"
      variant="default"
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 font-semibold shadow-lg"
    />
  );
}
