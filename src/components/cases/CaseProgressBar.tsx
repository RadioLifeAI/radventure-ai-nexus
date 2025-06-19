
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, CheckCircle, Brain } from "lucide-react";

interface CaseProgressBarProps {
  currentStep: 'analysis' | 'answer' | 'feedback';
  timeSpent: number;
  maxTime?: number;
  hasAnswered: boolean;
  isCorrect?: boolean | null;
}

export function CaseProgressBar({ 
  currentStep, 
  timeSpent, 
  maxTime = 600, 
  hasAnswered, 
  isCorrect 
}: CaseProgressBarProps) {
  const steps = [
    { key: 'analysis', label: 'Análise', icon: Brain },
    { key: 'answer', label: 'Resposta', icon: Target },
    { key: 'feedback', label: 'Feedback', icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => {
    if (hasAnswered) return 2;
    if (currentStep === 'answer') return 1;
    return 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeProgress = Math.min((timeSpent / maxTime) * 100, 100);
  const timeColor = timeProgress < 50 ? 'text-green-600' : 
                   timeProgress < 80 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      {/* Timeline Steps */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === getCurrentStepIndex();
          const isCompleted = index < getCurrentStepIndex();
          
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isActive 
                    ? 'bg-blue-500 border-blue-500 text-white animate-pulse' 
                    : 'bg-gray-200 border-gray-300 text-gray-500'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Time and Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${timeColor}`} />
            <span className={`font-mono text-sm ${timeColor}`}>
              {formatTime(timeSpent)}
            </span>
          </div>
          <Progress value={timeProgress} className="w-32 h-2" />
        </div>
        
        {hasAnswered && (
          <Badge className={`${
            isCorrect ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {isCorrect ? '✓ Correto' : '✗ Incorreto'}
          </Badge>
        )}
      </div>
    </div>
  );
}
