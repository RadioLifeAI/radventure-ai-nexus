
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface ConfidenceSelectorProps {
  confidence: number;
  onConfidenceChange: (value: number) => void;
  disabled?: boolean;
}

export function ConfidenceSelector({ 
  confidence, 
  onConfidenceChange, 
  disabled = false 
}: ConfidenceSelectorProps) {
  const getConfidenceLevel = (value: number) => {
    if (value >= 80) return { label: 'Muito Confiante', color: 'bg-green-500', icon: CheckCircle };
    if (value >= 60) return { label: 'Confiante', color: 'bg-blue-500', icon: TrendingUp };
    if (value >= 40) return { label: 'Moderado', color: 'bg-yellow-500', icon: AlertTriangle };
    return { label: 'Pouco Confiante', color: 'bg-red-500', icon: AlertTriangle };
  };

  const level = getConfidenceLevel(confidence);
  const Icon = level.icon;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-purple-600" />
          <span className="font-semibold text-purple-800">Nível de Confiança</span>
        </div>
        <Badge className={`${level.color} text-white`}>
          {confidence}% - {level.label}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <Slider
          value={[confidence]}
          onValueChange={(value) => onConfidenceChange(value[0])}
          max={100}
          min={0}
          step={5}
          disabled={disabled}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>0% - Sem certeza</span>
          <span>50% - Neutro</span>
          <span>100% - Totalmente certo</span>
        </div>
      </div>
      
      <p className="text-xs text-purple-600 mt-2">
        Sua confiança na resposta será usada para personalizar futuras recomendações de estudo.
      </p>
    </div>
  );
}
