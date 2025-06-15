import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { EventBannerUpload } from "./EventBannerUpload";
import { CaseFiltersSelector } from "./CaseFiltersSelector";
import { EventTemplatesModal } from "./EventTemplatesModal";
import { CaseFilterStatsBar } from "./CaseFilterStatsBar";
import { useCaseFiltersStats } from "../hooks/useCaseFiltersStats";
import { ConfigAlertBanner } from "./ConfigAlertBanner";
import { EventConfigProgressBar } from "./EventConfigProgressBar";
import { useEventConfigProgress } from "../hooks/useEventConfigProgress";
import { EventConfigMotivationPhrase } from "./EventConfigMotivationPhrase";
import { CaseFiltersGamifiedSection } from "./CaseFiltersGamifiedSection";

type Prize = { position: number, prize: number };

export function CreateEventForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [prizeRadcoins, setPrizeRadcoins] = useState(1000);
  const [numberOfCases, setNumberOfCases] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [maxParticipants, setMaxParticipants] = useState<number | "">("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [autoStart, setAutoStart] = useState(true);
  const [prizeDistribution, setPrizeDistribution] = useState<Prize[]>([
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
  ]);
  const [caseFilters, setCaseFilters] = useState({});
  const [showTemplates, setShowTemplates] = useState(false);

  // Estatísticas dos filtros (número de casos, dificuldade estimada etc)
  const { stats, loading: statsLoading } = useCaseFiltersStats(caseFilters);
  // Progresso de configuração
  const progress = useEventConfigProgress({
    name, scheduledStart, scheduledEnd, numberOfCases, durationMinutes, caseFilters
  });

  // Validação rápida e warnings
  let alertMsg = "";
  if ((!!caseFilters && Object.keys(caseFilters).length > 0) && stats.count < numberOfCases) {
    alertMsg = `Atenção: Apenas ${stats.count} casos disponíveis para os filtros selecionados (menos que o número de casos do evento).`;
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

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("events").insert({
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
      case_filters: caseFilters
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao criar evento!", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Evento criado com sucesso!" });
      if (onCreated) onCreated();
    }
  }

  function handlePrizeChange(index: number, value: number) {
    setPrizeDistribution((old) =>
      old.map((p, i) => (i === index ? { ...p, prize: value } : p))
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 bg-white rounded shadow space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 mb-1">
        <EventConfigMotivationPhrase />
        <EventConfigProgressBar percent={progress} />
        <CaseFilterStatsBar stats={stats} loading={statsLoading} />
        <ConfigAlertBanner message={alertMsg} />
      </div>
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold">Novo Evento</h2>
        <button type="button" className="border px-3 py-1 rounded text-xs bg-blue-50 hover:bg-blue-100 border-blue-200"
          onClick={() => setShowTemplates(true)}>Templates rápidos</button>
      </div>
      {/* Nova seção gamificada de filtros */}
      <CaseFiltersGamifiedSection value={caseFilters} onChange={setCaseFilters} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-semibold block">Título do evento</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="input border rounded px-2 py-1 w-full" />
        </div>
        <div>
          <label className="font-semibold block">Banner do evento</label>
          <EventBannerUpload value={bannerUrl} onChange={setBannerUrl} />
        </div>
        <div>
          <label className="font-semibold block">Início</label>
          <input type="datetime-local" value={scheduledStart} onChange={e => setScheduledStart(e.target.value)} required className="input border rounded px-2 py-1 w-full" />
        </div>
        <div>
          <label className="font-semibold block">Término</label>
          <input type="datetime-local" value={scheduledEnd} onChange={e => setScheduledEnd(e.target.value)} required className="input border rounded px-2 py-1 w-full" />
        </div>
        <div>
          <label className="font-semibold block">Total em RadCoins</label>
          <input type="number" value={prizeRadcoins} onChange={e => setPrizeRadcoins(Number(e.target.value))} min={0} className="input border rounded px-2 py-1 w-full" />
        </div>
        <div>
          <label className="font-semibold block">Nº de casos do evento</label>
          <input type="number" value={numberOfCases} onChange={e => setNumberOfCases(Number(e.target.value))} min={1} className="input border rounded px-2 py-1 w-full" />
        </div>
        <div>
          <label className="font-semibold block">Duração total (minutos)</label>
          <input type="number" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} min={1} className="input border rounded px-2 py-1 w-full" />
        </div>
        <div>
          <label className="font-semibold block">Limite de participantes</label>
          <input type="number" value={maxParticipants === null ? "" : maxParticipants} onChange={e => setMaxParticipants(e.target.value === "" ? "" : Number(e.target.value))} min={1} className="input border rounded px-2 py-1 w-full" />
        </div>
        <div className="col-span-2 flex items-center gap-2 mt-2">
          <input type="checkbox" checked={autoStart} onChange={e => setAutoStart(e.target.checked)} id="autoStart" />
          <label htmlFor="autoStart">Início automático</label>
        </div>
        <div className="col-span-2 mt-2">
          <label className="font-semibold block">Premiação (RadCoins para cada posição)</label>
          <div className="grid grid-cols-2 gap-2">
            {prizeDistribution.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>{p.position}º:</span>
                <input
                  type="number"
                  className="input border rounded px-2 py-1 w-24"
                  value={p.prize}
                  min={0}
                  onChange={e => handlePrizeChange(i, Number(e.target.value))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {showTemplates && (
        <EventTemplatesModal
          onApplyTemplate={handleApplyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Criando evento..." : "Criar evento"}
      </Button>
    </form>
  );
}
