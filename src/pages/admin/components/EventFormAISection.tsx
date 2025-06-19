
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventTemplatesAdvancedModal } from "./EventTemplatesAdvancedModal";
import { EventAIOptimizer } from "./EventAIOptimizer";
import { EventSmartScheduler } from "./EventSmartScheduler";
import { EventAutomationHub } from "./EventAutomationHub";
import { EventAISuggestions } from "./EventAISuggestions";
import {
  Brain,
  Sparkles,
  Calendar,
  Zap,
  Target,
  Lightbulb,
  TrendingUp
} from "lucide-react";

interface Props {
  onApplySuggestion: (suggestion: any) => void;
  onAutoFill: (data: any) => void;
  onApplyTemplate: (template: any) => void;
  onApplyOptimization: (optimization: any) => void;
  onSelectSchedule: (date: Date, time: string) => void;
  onConfigureAutomation: (ruleId: string, config: any) => void;
  currentFilters?: any;
  eventData?: any;
}

export function EventFormAISection({
  onApplySuggestion,
  onAutoFill,
  onApplyTemplate,
  onApplyOptimization,
  onSelectSchedule,
  onConfigureAutomation,
  currentFilters,
  eventData
}: Props) {
  const [activeTab, setActiveTab] = useState("suggestions");
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  const aiFeatures = [
    {
      id: "suggestions",
      title: "Sugestões Inteligentes",
      description: "IA gera ideias baseadas em dados reais",
      icon: Lightbulb,
      color: "text-yellow-600"
    },
    {
      id: "templates", 
      title: "Templates Avançados",
      description: "Templates otimizados por sucesso histórico",
      icon: Sparkles,
      color: "text-purple-600"
    },
    {
      id: "optimizer",
      title: "Otimizador de IA",
      description: "Analisa e sugere melhorias automáticas",
      icon: Target,
      color: "text-green-600"
    },
    {
      id: "scheduler",
      title: "Agendamento Inteligente",
      description: "Encontra os melhores horários",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      id: "automations",
      title: "Automações",
      description: "Configure automações inteligentes",
      icon: Zap,
      color: "text-orange-600"
    }
  ];

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Brain className="h-6 w-6 text-purple-600" />
          Central de IA para Eventos
          <Badge className="bg-purple-100 text-purple-700 ml-auto">
            <TrendingUp className="h-3 w-3 mr-1" />
            Novo
          </Badge>
        </CardTitle>
        <p className="text-purple-700 text-sm">
          Use inteligência artificial para criar eventos otimizados e de alto engajamento
        </p>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            {aiFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <TabsTrigger 
                  key={feature.id} 
                  value={feature.id}
                  className="flex flex-col items-center gap-1 py-3"
                >
                  <Icon className={`h-4 w-4 ${feature.color}`} />
                  <span className="text-xs hidden sm:inline">{feature.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <EventAISuggestions
                onApplySuggestion={onApplySuggestion}
                onAutoFill={onAutoFill}
                currentFilters={currentFilters}
              />
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold mb-2">Templates Inteligentes</h3>
                <p className="text-gray-600 mb-4">
                  Acesse templates otimizados baseados em eventos de sucesso
                </p>
                <Button 
                  onClick={() => setShowTemplatesModal(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Explorar Templates
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimizer" className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <EventAIOptimizer
                eventData={eventData}
                onApplyOptimization={onApplyOptimization}
                onRunAnalysis={() => {}}
              />
            </div>
          </TabsContent>

          <TabsContent value="scheduler" className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <EventSmartScheduler
                onSelectSchedule={onSelectSchedule}
                onGenerateOptions={() => {}}
                currentEvent={eventData}
              />
            </div>
          </TabsContent>

          <TabsContent value="automations" className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <EventAutomationHub
                onConfigureAutomation={onConfigureAutomization}
                onToggleAutomation={() => {}}
                onCreateRule={() => {}}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Templates */}
        <EventTemplatesAdvancedModal
          open={showTemplatesModal}
          onClose={() => setShowTemplatesModal(false)}
          onApplyTemplate={(template) => {
            onApplyTemplate(template);
            setShowTemplatesModal(false);
          }}
          onCreateCustomTemplate={() => {}}
          currentFilters={currentFilters}
        />
      </CardContent>
    </Card>
  );
}
