
import React, { useState, useEffect } from 'react';
import { EventForm } from './EventForm';
import { RealtimeCollaboration } from './RealtimeCollaboration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { aiGateway } from '@/lib/ai-gateway/AIGateway';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/lib/analytics/AnalyticsProvider';
import { 
  Brain, 
  Users, 
  Sparkles, 
  TrendingUp,
  Clock,
  Target,
  Lightbulb,
  Zap
} from 'lucide-react';

interface AIIntegratedEventFormProps {
  mode: 'create' | 'edit';
  initialValues?: any;
  loading?: boolean;
  onSubmit: (values: any) => void;
  onCancel?: () => void;
}

export function AIIntegratedEventForm({
  mode,
  initialValues,
  loading,
  onSubmit,
  onCancel
}: AIIntegratedEventFormProps) {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [optimizations, setOptimizations] = useState<any[]>([]);
  const [scheduleRecommendations, setScheduleRecommendations] = useState<any[]>([]);
  const [eventData, setEventData] = useState(initialValues || {});
  const [activeTab, setActiveTab] = useState('form');

  useEffect(() => {
    if (mode === 'create') {
      loadAISuggestions();
    } else if (mode === 'edit' && initialValues?.id) {
      loadOptimizations();
    }
    track('ai_event_form_view', { mode });
  }, [mode, initialValues]);

  const loadAISuggestions = async () => {
    if (!user) return;
    
    setLoadingSuggestions(true);
    try {
      const suggestions = await aiGateway.generateEventSuggestions(
        'Eventos médicos educacionais diversos',
        user.id
      );
      setAiSuggestions(suggestions);
      track('ai_suggestions_loaded', { count: suggestions.length });
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const loadOptimizations = async () => {
    if (!user || !initialValues?.id) return;
    
    try {
      const opts = await aiGateway.optimizeEvent(initialValues, user.id);
      setOptimizations(opts);
      track('ai_optimizations_loaded', { eventId: initialValues.id });
    } catch (error) {
      console.error('Error loading optimizations:', error);
    }
  };

  const applySuggestion = (suggestion: any) => {
    setEventData(suggestion);
    setActiveTab('form');
    track('ai_suggestion_applied', { suggestion: suggestion.name });
  };

  const applyOptimization = (optimization: any) => {
    // Apply optimization to event data
    const updatedData = { ...eventData };
    
    switch (optimization.type) {
      case 'schedule':
        // Apply schedule optimization
        break;
      case 'prizes':
        // Apply prize optimization
        break;
      // Add more optimization types
    }
    
    setEventData(updatedData);
    track('ai_optimization_applied', { type: optimization.type });
  };

  const generateSmartSchedule = async () => {
    if (!user) return;
    
    try {
      const schedule = await aiGateway.getSmartSchedule(
        {
          targetAudience: eventData.target || 'residents',
          duration: eventData.durationMinutes || 30,
          specialty: eventData.specialty
        },
        user.id
      );
      setScheduleRecommendations(schedule);
      track('ai_schedule_generated');
    } catch (error) {
      console.error('Error generating schedule:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Status Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Sistema de IA Avançado
            <Badge className="bg-purple-100 text-purple-700">
              <Sparkles className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm">Sugestões: {aiSuggestions.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Otimizações: {optimizations.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Agendamentos: {scheduleRecommendations.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suggestions">
            <Lightbulb className="h-4 w-4 mr-2" />
            Sugestões IA
          </TabsTrigger>
          <TabsTrigger value="form">
            <Target className="h-4 w-4 mr-2" />
            Formulário
          </TabsTrigger>
          <TabsTrigger value="collaboration">
            <Users className="h-4 w-4 mr-2" />
            Colaboração
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <Zap className="h-4 w-4 mr-2" />
            Otimização
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sugestões Inteligentes de IA</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSuggestions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3">Gerando sugestões...</span>
                </div>
              ) : (
                <div className="grid gap-4">
                  {aiSuggestions.map((suggestion, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{suggestion.name}</CardTitle>
                            <p className="text-gray-600 mt-1">{suggestion.description}</p>
                          </div>
                          <Button onClick={() => applySuggestion(suggestion)}>
                            Aplicar
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{suggestion.specialty}</Badge>
                          <Badge variant="outline">{suggestion.modality}</Badge>
                          <Badge variant="outline">{suggestion.numberOfCases} casos</Badge>
                          <Badge variant="outline">{suggestion.durationMinutes}min</Badge>
                          <Badge variant="outline">{suggestion.prizeRadcoins} RC</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <EventForm
            mode={mode}
            initialValues={eventData}
            loading={loading}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </TabsContent>

        <TabsContent value="collaboration">
          {initialValues?.id && (
            <RealtimeCollaboration
              eventId={initialValues.id}
              onCollaborativeEdit={(changes) => {
                setEventData(prev => ({ ...prev, ...changes }));
              }}
            />
          )}
          {!initialValues?.id && (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  A colaboração em tempo real estará disponível após salvar o evento
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Agendamento Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={generateSmartSchedule} className="mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  Gerar Recomendações de Horário
                </Button>
                
                {scheduleRecommendations.length > 0 && (
                  <div className="space-y-3">
                    {scheduleRecommendations.map((rec, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {new Date(rec.datetime).toLocaleString('pt-BR')}
                            </p>
                            <p className="text-sm text-gray-600">{rec.reasoning}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            Score: {rec.score}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {optimizations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Otimizações Recomendadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optimizations.map((opt, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{opt.suggestion}</p>
                          <p className="text-sm text-gray-600">
                            Impacto esperado: {opt.impact}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {opt.confidence}% confiança
                          </Badge>
                          <Button size="sm" onClick={() => applyOptimization(opt)}>
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
