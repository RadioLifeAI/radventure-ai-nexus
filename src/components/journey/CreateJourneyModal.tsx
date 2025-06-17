
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Target, Clock, Zap } from "lucide-react";

interface CreateJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateJourneyModal({ isOpen, onClose }: CreateJourneyModalProps) {
  const [formData, setFormData] = useState({
    goal: "",
    specialty: "",
    timeAvailable: "",
    experience: "",
    preferences: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJourney, setGeneratedJourney] = useState<any>(null);

  const handleGenerateJourney = async () => {
    setIsGenerating(true);
    
    // Simular geração com IA (implementar integração real depois)
    setTimeout(() => {
      setGeneratedJourney({
        title: `Trilha Personalizada: ${formData.specialty || 'Medicina Geral'}`,
        duration: "4 semanas",
        modules: [
          {
            name: "Fundamentos",
            cases: 8,
            difficulty: "Básico",
            estimated: "1 semana"
          },
          {
            name: "Casos Intermediários",
            cases: 12,
            difficulty: "Intermediário",
            estimated: "2 semanas"
          },
          {
            name: "Desafios Avançados",
            cases: 6,
            difficulty: "Avançado",
            estimated: "1 semana"
          }
        ],
        totalCases: 26,
        estimatedPoints: 650
      });
      setIsGenerating(false);
    }, 2000);
  };

  const specialties = [
    "Radiologia", "Cardiologia", "Neurologia", "Dermatologia", 
    "Pneumologia", "Gastroenterologia", "Medicina Interna"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-6 w-6 text-purple-600" />
            Crie sua Jornada Personalizada
          </DialogTitle>
          <DialogDescription>
            Nossa IA criará uma trilha de aprendizado personalizada baseada nos seus objetivos
          </DialogDescription>
        </DialogHeader>

        {!generatedJourney ? (
          <div className="space-y-6">
            {/* Formulário de preferências */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal">Qual seu objetivo principal?</Label>
                <Input
                  id="goal"
                  placeholder="Ex: Melhorar diagnóstico por imagem, preparar para residência..."
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="specialty">Especialidade de interesse</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {specialties.map((spec) => (
                    <Badge
                      key={spec}
                      variant={formData.specialty === spec ? "default" : "outline"}
                      className="cursor-pointer justify-center py-2"
                      onClick={() => setFormData({...formData, specialty: spec})}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="timeAvailable">Tempo disponível por semana</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {["1-2h", "3-5h", "6-10h", "10+h"].map((time) => (
                    <Badge
                      key={time}
                      variant={formData.timeAvailable === time ? "default" : "outline"}
                      className="cursor-pointer justify-center py-2"
                      onClick={() => setFormData({...formData, timeAvailable: time})}
                    >
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Seu nível de experiência</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["Iniciante", "Intermediário", "Avançado"].map((exp) => (
                    <Badge
                      key={exp}
                      variant={formData.experience === exp ? "default" : "outline"}
                      className="cursor-pointer justify-center py-2"
                      onClick={() => setFormData({...formData, experience: exp})}
                    >
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="preferences">Preferências adicionais (opcional)</Label>
                <Textarea
                  id="preferences"
                  placeholder="Ex: Focar em casos raros, incluir mais imagens, priorizar casos práticos..."
                  value={formData.preferences}
                  onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                />
              </div>
            </div>

            <Button 
              onClick={handleGenerateJourney}
              disabled={!formData.goal || !formData.specialty || isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Gerando sua jornada personalizada...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Gerar Jornada com IA
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Jornada gerada */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-purple-800 mb-2">
                {generatedJourney.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-purple-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {generatedJourney.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {generatedJourney.totalCases} casos
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  {generatedJourney.estimatedPoints} pontos
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Módulos da Jornada:</h4>
              {generatedJourney.modules.map((module: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium">{module.name}</h5>
                    <Badge variant="outline">{module.difficulty}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {module.cases} casos • {module.estimated}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setGeneratedJourney(null)}
                variant="outline"
                className="flex-1"
              >
                Ajustar Preferências
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={onClose}
              >
                Iniciar Jornada
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
