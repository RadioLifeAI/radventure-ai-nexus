
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { EventBannerUpload } from "./EventBannerUpload";
import { CaseFiltersSelector } from "./CaseFiltersSelector";

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
  // Filtros de seleção de casos
  const [caseFilters, setCaseFilters] = useState({});

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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-bold">Novo Evento</h2>
      
      <CaseFiltersSelector value={caseFilters} onChange={setCaseFilters} />

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
      <Button type="submit" disabled={loading}>
        {loading ? "Criando evento..." : "Criar evento"}
      </Button>
    </form>
  );
}
