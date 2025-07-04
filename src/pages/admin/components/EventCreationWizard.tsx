import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Target,
  Calendar,
  Trophy,
  Filter,
  Image as ImageIcon,
  CheckCircle,
  Save
} from "lucide-react";

// Importar componentes existentes
import { EventFormAISection } from "./EventFormAISection";
import { BasicInfoSection, ScheduleSection, GameConfigSection, PrizeDistributionSection } from "./EventFormSections";
import { CaseFiltersGamifiedSection } from "./CaseFiltersGamifiedSection";
import { EventBannerUpload } from "./EventBannerUpload";
import { CaseFilterStatsBar } from "./CaseFilterStatsBar";
import { useCaseFiltersStats } from "../hooks/useCaseFiltersStats";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  valid: boolean;
  required: boolean;
}

interface EventCreationWizardProps {
  mode: "create" | "edit";
  initialValues?: any;
  loading?: boolean;
  onSubmit: (values: any) => void;
  onCancel?: () => void;
}

export function EventCreationWizard({
  mode,
  initialValues = {},
  loading = false,
  onSubmit,
  onCancel
}: EventCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [eventId, setEventId] = useState<string | null>(
    mode === "edit" ? initialValues.id || null : null
  );

  // Estados do formulário
  const [name, setName] = useState(initialValues.name ?? "");
  const [description, setDescription] = useState(initialValues.description ?? "");
  const [scheduledStart, setScheduledStart] = useState(initialValues.scheduled_start ?? "");
  const [scheduledEnd, setScheduledEnd] = useState(initialValues.scheduled_end ?? "");
  const [prizeRadcoins, setPrizeRadcoins] = useState(initialValues.prize_radcoins ?? 1000);
  const [numberOfCases, setNumberOfCases] = useState(initialValues.number_of_cases ?? 10);
  const [durationMinutes, setDurationMinutes] = useState(initialValues.duration_minutes ?? 30);
  const [maxParticipants, setMaxParticipants] = useState(
    initialValues.max_participants === null || initialValues.max_participants === undefined
      ? ""
      : initialValues.max_participants
  );
  const [bannerUrl, setBannerUrl] = useState(initialValues.banner_url ?? "");
  const [autoStart, setAutoStart] = useState(initialValues.auto_start ?? true);
  const [prizeDistribution, setPrizeDistribution] = useState(
    initialValues.prize_distribution ?? [
      { position: 1, prize: 500 },
      { position: 2, prize: 200 },
      { position: 3, prize: 100 },
      { position: 4, prize: 50 },
      { position: 5, prize: 40 },
      { position: 6, prize: 30 },
      { position: 7, prize: 30 },
      { position: 8, prize: 20 },
      { position: 9, prize: 15 },
      { position: 10, prize: 10 },
    ]
  );
  const [caseFilters, setCaseFilters] = useState(initialValues.case_filters ?? {});

  // Estatísticas dos filtros
  const { stats, loading: statsLoading } = useCaseFiltersStats(caseFilters);

  // Definição das etapas do wizard
  const steps: WizardStep[] = [
    {
      id: "ai-templates",
      title: "IA & Templates",
      description: "Use inteligência artificial e templates",
      icon: <Sparkles className="h-5 w-5" />,
      completed: false,
      valid: true,
      required: false
    },
    {
      id: "basic-info",
      title: "Informações Básicas",
      description: "Nome e descrição do evento",
      icon: <Target className="h-5 w-5" />,
      completed: false,
      valid: false,
      required: true
    },
    {
      id: "schedule",
      title: "Cronograma",
      description: "Datas, duração e configurações temporais",
      icon: <Calendar className="h-5 w-5" />,
      completed: false,
      valid: false,
      required: true
    },
    {
      id: "game-config",
      title: "Configuração de Jogo",
      description: "Casos, participantes e prêmios",
      icon: <Trophy className="h-5 w-5" />,
      completed: false,
      valid: false,
      required: true
    },
    {
      id: "case-filters",
      title: "Filtros de Casos",
      description: "Especialidade, modalidade e dificuldade",
      icon: <Filter className="h-5 w-5" />,
      completed: false,
      valid: true,
      required: false
    },
    {
      id: "banner-final",
      title: "Banner & Finalização",
      description: "Upload de imagem e revisão final",
      icon: <ImageIcon className="h-5 w-5" />,
      completed: false,
      valid: true,
      required: false
    }
  ];

  // Validação automática de cada etapa
  useEffect(() => {
    validateCurrentStep();
  }, [name, scheduledStart, scheduledEnd, numberOfCases, durationMinutes, currentStep]);

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    let isValid = false;

    switch (step.id) {
      case "ai-templates":
        isValid = true;
        break;
      case "basic-info":
        isValid = !!(name.trim());
        break;
      case "schedule":
        isValid = !!(scheduledStart && scheduledEnd && durationMinutes > 0);
        break;
      case "game-config":
        isValid = !!(numberOfCases > 0 && prizeRadcoins >= 0);
        break;
      case "case-filters":
        isValid = true;
        break;
      case "banner-final":
        isValid = true;
        break;
    }

    steps[currentStep].valid = isValid;
    steps[currentStep].completed = isValid;
  };

  const nextStep = async () => {
    // RESOLVER PROBLEMA DO BANNER: Criar evento antes da etapa 6
    if (currentStep === 4 && mode === "create" && !eventId) {
      await handleCreateEventForBanner();
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCreateEventForBanner = async () => {
    try {
      console.log('🔄 Criando evento antes do upload do banner...');
      
      const { data: userData } = await supabase.auth.getUser();
      
      const eventData = {
        name,
        description,
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
        prize_radcoins: prizeRadcoins,
        number_of_cases: numberOfCases,
        duration_minutes: durationMinutes,
        max_participants: maxParticipants === "" ? null : maxParticipants,
        banner_url: "", // Será preenchido na próxima etapa
        auto_start: autoStart,
        prize_distribution: prizeDistribution,
        case_filters: caseFilters,
        status: "SCHEDULED" as const,
        created_by: userData.user?.id
      };

      const { data: createdEvent, error } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Evento criado:', createdEvent.id);
      setEventId(createdEvent.id);
      setCurrentStep(currentStep + 1);

      toast({
        title: "✅ Evento criado!",
        description: "Agora você pode adicionar o banner do evento.",
        className: "bg-green-50 border-green-200"
      });
      
    } catch (error: any) {
      console.error('❌ Erro ao criar evento:', error);
      toast({
        title: "❌ Erro ao criar evento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handlePrizeChange = (index: number, value: number) => {
    setPrizeDistribution((old) =>
      old.map((p, i) => (i === index ? { ...p, prize: value } : p))
    );
  };

  const handleApplySuggestion = (suggestion: any) => {
    console.log("AI Suggestion received:", suggestion);
    
    let fieldsUpdated: string[] = [];
    
    if (suggestion.name) {
      setName(suggestion.name);
      fieldsUpdated.push("nome");
    }
    if (suggestion.description) {
      setDescription(suggestion.description);
      fieldsUpdated.push("descrição");
    }
    if (suggestion.numberOfCases) {
      setNumberOfCases(suggestion.numberOfCases);
      fieldsUpdated.push("número de casos");
    }
    if (suggestion.durationMinutes) {
      setDurationMinutes(suggestion.durationMinutes);
      fieldsUpdated.push("duração");
    }
    if (suggestion.prizeRadcoins) {
      setPrizeRadcoins(suggestion.prizeRadcoins);
      fieldsUpdated.push("prêmio total");
    }
    
    // Aplicar filtros de casos
    if (suggestion.specialty || suggestion.modality || suggestion.difficulty) {
      const newFilters: any = { ...caseFilters };
      
      if (suggestion.specialty) {
        newFilters.category = [suggestion.specialty];
        fieldsUpdated.push("especialidade");
      }
      if (suggestion.modality) {
        newFilters.modality = [suggestion.modality];
        fieldsUpdated.push("modalidade");
      }
      if (suggestion.difficulty) {
        newFilters.difficulty = [suggestion.difficulty.toString()];
        fieldsUpdated.push("dificuldade");
      }
      
      setCaseFilters(newFilters);
    }
    
    toast({
      title: "✨ Sugestão aplicada!",
      description: `Campos preenchidos: ${fieldsUpdated.join(", ")}`,
      className: "bg-blue-50 border-blue-200"
    });
  };

  const handleAutoFill = (data: any) => {
    console.log("Auto-fill data received:", data);
    
    let fieldsUpdated: string[] = [];
    
    if (data.name) {
      setName(data.name);
      fieldsUpdated.push("nome");
    }
    if (data.description) {
      setDescription(data.description);
      fieldsUpdated.push("descrição");
    }
    if (data.numberOfCases) {
      setNumberOfCases(data.numberOfCases);
      fieldsUpdated.push("número de casos");
    }
    if (data.durationMinutes) {
      setDurationMinutes(data.durationMinutes);
      fieldsUpdated.push("duração");
    }
    if (data.prizeRadcoins) {
      setPrizeRadcoins(data.prizeRadcoins);
      fieldsUpdated.push("prêmio total");
    }
    if (data.scheduled_start) {
      setScheduledStart(data.scheduled_start);
      fieldsUpdated.push("data de início");
    }
    if (data.scheduled_end) {
      setScheduledEnd(data.scheduled_end);
      fieldsUpdated.push("data de término");
    }
    if (data.maxParticipants) {
      setMaxParticipants(data.maxParticipants);
      fieldsUpdated.push("limite de participantes");
    }
    if (data.prize_distribution && Array.isArray(data.prize_distribution)) {
      setPrizeDistribution(data.prize_distribution);
      fieldsUpdated.push("distribuição de prêmios");
    }
    if (data.caseFilters) {
      setCaseFilters(data.caseFilters);
      fieldsUpdated.push("filtros de casos");
    }
    
    setAutoStart(true);
    fieldsUpdated.push("início automático");
    
    toast({
      title: "✨ Auto-preenchimento concluído!",
      description: `Campos preenchidos: ${fieldsUpdated.join(", ")}`,
      className: "bg-green-50 border-green-200"
    });
  };

  const handleApplyTemplate = (template: any) => {
    setCaseFilters(template.filters || {});
    setName(template.title || "");
    setNumberOfCases(template.numberOfCases || 10);
    setDurationMinutes(template.durationMinutes || 30);
    setPrizeRadcoins(template.prizeRadcoins || 500);
    setAutoStart(template.autoStart ?? true);
    
    toast({
      title: "📋 Template aplicado!",
      description: `Template "${template.title}" foi aplicado com sucesso.`,
      className: "bg-purple-50 border-purple-200"
    });
  };

  const handleApplyOptimization = (optimization: any) => {
    if (optimization.numberOfCases) setNumberOfCases(optimization.numberOfCases);
    if (optimization.durationMinutes) setDurationMinutes(optimization.durationMinutes);
    if (optimization.prizeRadcoins) setPrizeRadcoins(optimization.prizeRadcoins);
    if (optimization.maxParticipants) setMaxParticipants(optimization.maxParticipants);
    
    toast({
      title: "⚡ Otimização aplicada!",
      description: "Configurações otimizadas com base na análise de dados.",
      className: "bg-orange-50 border-orange-200"
    });
  };

  const handleSelectSchedule = (date: Date, time: string) => {
    const scheduledStart = new Date(date);
    const [hours, minutes] = time.split(':');
    scheduledStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const scheduledEnd = new Date(scheduledStart);
    scheduledEnd.setMinutes(scheduledEnd.getMinutes() + durationMinutes);

    setScheduledStart(scheduledStart.toISOString().slice(0, 16));
    setScheduledEnd(scheduledEnd.toISOString().slice(0, 16));

    toast({
      title: "📅 Horário selecionado!",
      description: `Evento agendado para ${date.toLocaleDateString('pt-BR')} às ${time}`,
      className: "bg-blue-50 border-blue-200"
    });
  };

  const handleFinalSubmit = () => {
    const eventData = {
      name,
      description,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      prize_radcoins: prizeRadcoins,
      number_of_cases: numberOfCases,
      duration_minutes: durationMinutes,
      max_participants: maxParticipants === "" ? null : maxParticipants,
      banner_url: bannerUrl,
      auto_start: autoStart,
      prize_distribution: prizeDistribution,
      case_filters: caseFilters,
      ...(mode === "edit" ? { id: eventId } : {})
    };

    // Se modo create e evento já foi criado, fazer update
    if (mode === "create" && eventId) {
      handleUpdateEvent(eventData);
    } else {
      onSubmit(eventData);
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({
          banner_url: bannerUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "✅ Evento finalizado!",
        description: "O evento foi criado com sucesso e está pronto para ser executado.",
        className: "bg-green-50 border-green-200"
      });

      // Redirecionar para lista de eventos
      if (onCancel) onCancel();
      
    } catch (error: any) {
      console.error('❌ Erro ao finalizar evento:', error);
      toast({
        title: "❌ Erro ao finalizar evento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case "ai-templates":
        return (
          <EventFormAISection
            onApplySuggestion={handleApplySuggestion}
            onAutoFill={handleAutoFill}
            onApplyTemplate={handleApplyTemplate}
            onApplyOptimization={handleApplyOptimization}
            onSelectSchedule={handleSelectSchedule}
            onConfigureAutomation={() => {}}
            currentFilters={caseFilters}
            eventData={{
              name, description, scheduledStart, scheduledEnd,
              numberOfCases, durationMinutes, prizeRadcoins, caseFilters
            }}
          />
        );

      case "basic-info":
        return (
          <BasicInfoSection
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}  
            bannerUrl="" // Banner será na etapa final
            setBannerUrl={() => {}} // Desabilitado nesta etapa
          />
        );

      case "schedule":
        return (
          <ScheduleSection
            scheduledStart={scheduledStart}
            setScheduledStart={setScheduledStart}
            scheduledEnd={scheduledEnd}
            setScheduledEnd={setScheduledEnd}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            autoStart={autoStart}
            setAutoStart={setAutoStart}
          />
        );

      case "game-config":
        return (
          <>
            <GameConfigSection
              numberOfCases={numberOfCases}
              setNumberOfCases={setNumberOfCases}
              maxParticipants={maxParticipants}
              setMaxParticipants={setMaxParticipants}
              prizeRadcoins={prizeRadcoins}
              setPrizeRadcoins={setPrizeRadcoins}
            />
            <PrizeDistributionSection
              prizeDistribution={prizeDistribution}
              onPrizeChange={handlePrizeChange}
            />
          </>
        );

      case "case-filters":
        return (
          <div className="space-y-6">
            <CaseFiltersGamifiedSection 
              value={caseFilters} 
              onChange={setCaseFilters} 
            />
            <CaseFilterStatsBar stats={stats} loading={statsLoading} />
            {stats.count < numberOfCases && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800">
                  ⚠️ <strong>Atenção:</strong> Apenas {stats.count} casos disponíveis para os filtros selecionados 
                  (menos que o número de casos do evento: {numberOfCases}).
                </p>
              </div>
            )}
          </div>
        );

      case "banner-final":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  Upload do Banner do Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventId ? (
                  <EventBannerUpload 
                    value={bannerUrl} 
                    onChange={setBannerUrl}
                    eventId={eventId}
                  />
                ) : (
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">
                      O evento precisa ser criado antes do upload do banner.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revisão Final */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Revisão Final do Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Nome:</strong> {name}</div>
                  <div><strong>Casos:</strong> {numberOfCases}</div>
                  <div><strong>Duração:</strong> {durationMinutes} min</div>
                  <div><strong>Prêmio Total:</strong> {prizeRadcoins} RadCoins</div>
                  <div><strong>Data Início:</strong> {new Date(scheduledStart).toLocaleString('pt-BR')}</div>
                  <div><strong>Data Fim:</strong> {new Date(scheduledEnd).toLocaleString('pt-BR')}</div>
                </div>
                
                {Object.keys(caseFilters).length > 0 && (
                  <div>
                    <strong>Filtros Aplicados:</strong>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      {caseFilters.category && <li>Especialidades: {caseFilters.category.join(", ")}</li>}
                      {caseFilters.modality && <li>Modalidades: {caseFilters.modality.join(", ")}</li>}
                      {caseFilters.difficulty && <li>Dificuldades: {caseFilters.difficulty.join(", ")}</li>}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Etapa não encontrada</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header do Wizard */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Badge className="bg-purple-100 text-purple-700">
            <Sparkles className="h-3 w-3 mr-1" />
            {mode === "create" ? "Criação de Evento" : "Edição de Evento"}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">
          {steps[currentStep].title}
        </h1>
        <p className="text-gray-600">
          {steps[currentStep].description}
        </p>
        <Progress value={progressPercentage} className="w-full max-w-md mx-auto" />
        <p className="text-sm text-gray-500">
          Etapa {currentStep + 1} de {steps.length} • {completedSteps} etapas completas
        </p>
      </div>

      {/* Navegação das Etapas */}
      <div className="flex justify-center">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${index === currentStep 
                  ? 'bg-blue-600 text-white' 
                  : step.completed 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {step.icon}
              <span className="hidden sm:inline">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da Etapa Atual */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {renderStepContent()}
      </div>

      {/* Navegação Inferior */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex gap-2">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
        </div>

        <div className="flex gap-2">
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleFinalSubmit}
              disabled={!steps[currentStep].valid || loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Finalizando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Finalizar Evento
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!steps[currentStep].valid || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}