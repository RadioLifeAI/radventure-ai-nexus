import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EventTemplatesModal } from "./EventTemplatesModal";
import { EventAISuggestions } from "./EventAISuggestions";
import { CaseFiltersGamifiedSection } from "./CaseFiltersGamifiedSection";
import { CaseFilterStatsBar } from "./CaseFilterStatsBar";
import { useCaseFiltersStats } from "../hooks/useCaseFiltersStats";
import { EventConfigProgressBar } from "./EventConfigProgressBar";
import { useEventConfigProgress } from "../hooks/useEventConfigProgress";
import { ConfigAlertBanner } from "./ConfigAlertBanner";
import { EventConfigMotivationPhrase } from "./EventConfigMotivationPhrase";
import { EventFormHeader } from "./EventFormHeader";
import { BasicInfoSection, ScheduleSection, GameConfigSection, PrizeDistributionSection } from "./EventFormSections";
import { toast } from "@/hooks/use-toast";

export type Prize = { position: number, prize: number };

type Props = {
  mode: "create" | "edit";
  initialValues?: any;
  loading?: boolean;
  onSubmit: (values: any) => void;
  onCancel?: () => void;
};

// Função auxiliar para gerar datas inteligentes
function generateSmartDates(durationMinutes: number = 30) {
  const now = new Date();
  const startDate = new Date(now);
  
  // Se for fim de semana, mover para próxima segunda
  if (startDate.getDay() === 0) { // Domingo
    startDate.setDate(startDate.getDate() + 1);
  } else if (startDate.getDay() === 6) { // Sábado
    startDate.setDate(startDate.getDate() + 2);
  }
  
  // Se for muito tarde (depois das 18h), mover para próximo dia útil às 14h
  if (startDate.getHours() >= 18) {
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(14, 0, 0, 0);
  } else if (startDate.getHours() < 8) {
    // Se for muito cedo (antes das 8h), definir para 14h do mesmo dia
    startDate.setHours(14, 0, 0, 0);
  } else {
    // Horário atual + 2 horas, arredondado para próxima hora cheia
    startDate.setHours(startDate.getHours() + 2, 0, 0, 0);
  }
  
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);
  
  return {
    scheduled_start: startDate.toISOString().slice(0, 16),
    scheduled_end: endDate.toISOString().slice(0, 16)
  };
}

// Função auxiliar para gerar distribuição de prêmios
function generatePrizeDistribution(totalPrize: number): Prize[] {
  const distributions = [
    { position: 1, percentage: 35 },
    { position: 2, percentage: 20 },
    { position: 3, percentage: 15 },
    { position: 4, percentage: 10 },
    { position: 5, percentage: 8 },
    { position: 6, percentage: 5 },
    { position: 7, percentage: 3 },
    { position: 8, percentage: 2 },
    { position: 9, percentage: 1 },
    { position: 10, percentage: 1 }
  ];
  
  return distributions.map(({ position, percentage }) => ({
    position,
    prize: Math.round((totalPrize * percentage) / 100)
  }));
}

export function EventForm({ mode, initialValues = {}, loading, onSubmit, onCancel }: Props) {
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
  const [prizeDistribution, setPrizeDistribution] = useState<Prize[]>(
    initialValues.prize_distribution ??
      [
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
  const [showTemplates, setShowTemplates] = useState(false);

  // Estatísticas filtros (real time)
  const { stats, loading: statsLoading } = useCaseFiltersStats(caseFilters);
  const progress = useEventConfigProgress({
    name, scheduledStart, scheduledEnd, numberOfCases, durationMinutes, caseFilters
  });

  // Validação rápida e warnings
  let alertMsg = "";
  if ((!!caseFilters && Object.keys(caseFilters).length > 0) && stats.count < numberOfCases) {
    alertMsg = `Atenção: Apenas ${stats.count} casos disponíveis para os filtros selecionados (menos que o número de casos do evento).`;
  }

  function handlePrizeChange(index: number, value: number) {
    setPrizeDistribution((old) =>
      old.map((p, i) => (i === index ? { ...p, prize: value } : p))
    );
  }

  function handleApplyTemplate(tpl: any) {
    setCaseFilters(tpl.filters || {});
    setName(tpl.title || "");
    setNumberOfCases(tpl.numberOfCases || 10);
    setDurationMinutes(tpl.durationMinutes || 30);
    setPrizeRadcoins(tpl.prizeRadcoins || 500);
    setAutoStart(tpl.autoStart ?? true);
    setShowTemplates(false);
  }

  function handleAISuggestion(suggestion: any) {
    console.log("AI Suggestion received:", suggestion);
    
    let fieldsUpdated: string[] = [];
    
    // PREENCHER CAMPOS BÁSICOS
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
    
    // GERAR DATAS INTELIGENTES baseado na duração sugerida
    const smartDates = generateSmartDates(suggestion.durationMinutes || 30);
    setScheduledStart(smartDates.scheduled_start);
    setScheduledEnd(smartDates.scheduled_end);
    fieldsUpdated.push("datas programadas");
    
    // GERAR DISTRIBUIÇÃO DE PRÊMIOS baseado no total sugerido
    if (suggestion.prizeRadcoins) {
      const newPrizeDistribution = generatePrizeDistribution(suggestion.prizeRadcoins);
      setPrizeDistribution(newPrizeDistribution);
      fieldsUpdated.push("distribuição de prêmios");
    }
    
    // DEFINIR MÁXIMO DE PARTICIPANTES baseado na dificuldade/duração
    let maxParticipantsValue = 50; // default
    if (suggestion.difficulty >= 3 || suggestion.durationMinutes >= 45) {
      maxParticipantsValue = 75; // eventos mais difíceis/longos têm mais participantes
    } else if (suggestion.difficulty <= 2 && suggestion.durationMinutes <= 30) {
      maxParticipantsValue = 40; // eventos mais fáceis/curtos têm menos participantes
    }
    setMaxParticipants(maxParticipantsValue);
    fieldsUpdated.push("limite de participantes");
    
    // SEMPRE ATIVAR AUTO-START para sugestões
    setAutoStart(true);
    fieldsUpdated.push("início automático");
    
    // MANTER BANNER VAZIO (opcional)
    setBannerUrl("");
    
    // APLICAR FILTROS DE CASOS (specialty → category mapping)
    if (suggestion.specialty || suggestion.modality || suggestion.subtype || suggestion.difficulty) {
      const newFilters: any = { ...caseFilters };
      
      if (suggestion.specialty) {
        newFilters.category = [suggestion.specialty];
        fieldsUpdated.push("especialidade");
      }
      if (suggestion.modality) {
        newFilters.modality = [suggestion.modality];
        fieldsUpdated.push("modalidade");
      }
      if (suggestion.subtype) {
        newFilters.subtype = [suggestion.subtype];
        fieldsUpdated.push("subtipo");
      }
      if (suggestion.difficulty) {
        newFilters.difficulty = [suggestion.difficulty.toString()];
        fieldsUpdated.push("dificuldade");
      }
      
      setCaseFilters(newFilters);
    }
    
    toast({
      title: "✨ Sugestão aplicada completamente!",
      description: `Campos preenchidos: ${fieldsUpdated.join(", ")}`,
      className: "bg-blue-50 border-blue-200"
    });
  }

  function handleAutoFill(data: any) {
    console.log("Auto-fill data received:", data);
    
    let fieldsUpdated: string[] = [];
    
    // Preencher campos básicos
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
    
    // SEMPRE true para auto-preenchimento
    setAutoStart(true);
    fieldsUpdated.push("início automático");
    
    // CORREÇÃO CRÍTICA: Aplicar datas corretamente
    if (data.scheduled_start) {
      setScheduledStart(data.scheduled_start);
      fieldsUpdated.push("data de início");
    }
    if (data.scheduled_end) {
      setScheduledEnd(data.scheduled_end);
      fieldsUpdated.push("data de término");
    }
    
    // CORREÇÃO: Preencher max participants
    if (data.maxParticipants) {
      setMaxParticipants(data.maxParticipants);
      fieldsUpdated.push("limite de participantes");
    }
    
    // CORREÇÃO: Aplicar banner URL se fornecido
    if (data.bannerUrl !== undefined) {
      setBannerUrl(data.bannerUrl);
      if (data.bannerUrl) fieldsUpdated.push("banner");
    }
    
    // CORREÇÃO CRÍTICA: Aplicar distribuição de prêmios completa
    if (data.prize_distribution && Array.isArray(data.prize_distribution)) {
      setPrizeDistribution(data.prize_distribution);
      fieldsUpdated.push("distribuição de prêmios");
    }
    
    // CORREÇÃO CRÍTICA: Mapear filtros corretamente (specialty -> category)
    if (data.caseFilters) {
      const mappedFilters: any = {};
      
      // Mapear specialty para category (CORREÇÃO PRINCIPAL)
      if (data.caseFilters.specialty && Array.isArray(data.caseFilters.specialty)) {
        mappedFilters.category = data.caseFilters.specialty;
        fieldsUpdated.push("especialidades");
      }
      
      // Aplicar outros filtros diretamente
      if (data.caseFilters.modality) {
        mappedFilters.modality = data.caseFilters.modality;
        fieldsUpdated.push("modalidades");
      }
      if (data.caseFilters.subtype) {
        mappedFilters.subtype = data.caseFilters.subtype;
        fieldsUpdated.push("subtipos");
      }
      if (data.caseFilters.difficulty) {
        mappedFilters.difficulty = data.caseFilters.difficulty.map((d: any) => d.toString());
        fieldsUpdated.push("dificuldades");
      }
      
      setCaseFilters(mappedFilters);
    }
    
    // Toast específico de sucesso com campos preenchidos
    toast({
      title: "✨ Auto-preenchimento concluído!",
      description: `Campos preenchidos: ${fieldsUpdated.join(", ")}`,
      className: "bg-green-50 border-green-200"
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validação robusta antes do submit
    const missingFields: string[] = [];
    
    if (!name.trim()) missingFields.push("nome");
    if (!scheduledStart) missingFields.push("data de início");
    if (!scheduledEnd) missingFields.push("data de término");
    if (numberOfCases < 1) missingFields.push("número de casos válido");
    if (durationMinutes < 1) missingFields.push("duração válida");
    
    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: `Preencha: ${missingFields.join(", ")}`,
        variant: "destructive"
      });
      return;
    }
    
    onSubmit({
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
      // O modo edit pode receber id e campos extras
      ...(mode === "edit" ? { id: initialValues.id } : {})
    });
  }

  // Atualizar valores quando mudar evento editado
  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setName(initialValues.name ?? "");
      setDescription(initialValues.description ?? "");
      setScheduledStart(initialValues.scheduled_start ?? "");
      setScheduledEnd(initialValues.scheduled_end ?? "");
      setPrizeRadcoins(initialValues.prize_radcoins ?? 1000);
      setNumberOfCases(initialValues.number_of_cases ?? 10);
      setDurationMinutes(initialValues.duration_minutes ?? 30);
      setMaxParticipants(
        initialValues.max_participants === null || initialValues.max_participants === undefined
          ? ""
          : initialValues.max_participants
      );
      setBannerUrl(initialValues.banner_url ?? "");
      setAutoStart(initialValues.auto_start ?? true);
      setPrizeDistribution(
        initialValues.prize_distribution ??
        [
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
      setCaseFilters(initialValues.case_filters ?? {});
    }
  }, [mode, initialValues]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <EventFormHeader 
        mode={mode} 
        onShowTemplates={() => setShowTemplates(true)} 
      />

      <div className="space-y-6">
        <div className="space-y-4">
          <EventConfigMotivationPhrase />
          <EventConfigProgressBar percent={progress} />
          <CaseFilterStatsBar stats={stats} loading={statsLoading} />
          <ConfigAlertBanner message={alertMsg} />
        </div>

        <EventAISuggestions 
          onApplySuggestion={handleAISuggestion}
          onAutoFill={handleAutoFill}
          currentFilters={caseFilters}
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Filtros de casos com dados reais unificados */}
          <CaseFiltersGamifiedSection value={caseFilters} onChange={setCaseFilters} />

          {/* Seções do formulário com layout gamificado */}
          <BasicInfoSection
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            bannerUrl={bannerUrl}
            setBannerUrl={setBannerUrl}
          />

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

          <div className="flex justify-end gap-4 pt-6 border-t">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                mode === "create" ? "Criar Evento" : "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>

        {showTemplates && (
          <EventTemplatesModal
            onApplyTemplate={handleApplyTemplate}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </div>
    </div>
  );
}
