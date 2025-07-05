import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EventParticipant {
  id: string;
  user_id: string;
  registered_at: string;
  profiles: {
    id: string;
    full_name: string;
    username: string;
    email: string;
    academic_stage?: string;
    medical_specialty?: string;
    total_points: number;
    user_level: number;
  };
  progress?: {
    status: string;
    cases_completed: number;
    cases_correct: number;
    current_score: number;
    time_spent_seconds: number;
  };
}

export interface ParticipantStats {
  total: number;
  students: number;
  residents: number;
  specialists: number;
  avgLevel: number;
  avgPoints: number;
  avgCompletionTime: number;
  completionRate: number;
  avgAccuracy: number;
}

export function useEventParticipants(eventId: string) {
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [stats, setStats] = useState<ParticipantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    
    fetchParticipants();
  }, [eventId]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Buscar participantes registrados 
      const { data: registrations, error: registrationsError } = await supabase
        .from('event_registrations')
        .select('id, user_id, registered_at')
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false });

      if (registrationsError) throw registrationsError;
      if (!registrations || registrations.length === 0) {
        setParticipants([]);
        setStats(calculateParticipantStats([]));
        return;
      }

      const userIds = registrations.map(r => r.user_id);

      // 2. Buscar perfis dos participantes
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          username,
          email,
          academic_stage,
          medical_specialty,
          total_points,
          user_level
        `)
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // 3. Buscar progresso dos participantes
      const { data: progressData, error: progressError } = await supabase
        .from('user_event_progress')
        .select('*')
        .eq('event_id', eventId)
        .in('user_id', userIds);

      if (progressError) throw progressError;

      // 4. Combinar todos os dados
      const participantsWithData = registrations.map(registration => {
        const profile = profiles?.find(p => p.id === registration.user_id);
        const progress = progressData?.find(p => p.user_id === registration.user_id);
        
        return {
          ...registration,
          profiles: profile || {
            id: registration.user_id,
            full_name: "Nome não disponível",
            username: "unknown",
            email: "email@unknown.com",
            academic_stage: undefined,
            medical_specialty: undefined,
            total_points: 0,
            user_level: 1
          },
          progress: progress ? {
            status: progress.status,
            cases_completed: progress.cases_completed,
            cases_correct: progress.cases_correct,
            current_score: progress.current_score,
            time_spent_seconds: progress.time_spent_seconds
          } : undefined
        };
      });

      // 5. Calcular estatísticas
      const calculatedStats = calculateParticipantStats(participantsWithData);

      setParticipants(participantsWithData);
      setStats(calculatedStats);

    } catch (error: any) {
      console.error('Erro ao buscar participantes do evento:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportParticipants = (filteredParticipants: EventParticipant[], eventName: string) => {
    const csvData = filteredParticipants.map(p => ({
      Nome: p.profiles?.full_name || "",
      Email: p.profiles?.email || "",
      Username: p.profiles?.username || "",
      Nivel: p.profiles?.user_level || 1,
      Pontos: p.profiles?.total_points || 0,
      EtapaAcademica: p.profiles?.academic_stage || "",
      Especialidade: p.profiles?.medical_specialty || "",
      DataRegistro: new Date(p.registered_at).toLocaleDateString("pt-BR"),
      Status: p.progress?.status || "not_started",
      CasosCompletos: p.progress?.cases_completed || 0,
      CasosCorretos: p.progress?.cases_correct || 0,
      PontuacaoEvento: p.progress?.current_score || 0,
      TempoGasto: p.progress?.time_spent_seconds ? `${Math.round(p.progress.time_spent_seconds / 60)}min` : "0min"
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `participantes_${eventName.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return { 
    participants, 
    stats, 
    loading, 
    error, 
    refetch: fetchParticipants,
    exportParticipants 
  };
}

function calculateParticipantStats(participants: EventParticipant[]): ParticipantStats {
  const total = participants.length;
  
  if (total === 0) {
    return {
      total: 0,
      students: 0,
      residents: 0,
      specialists: 0,
      avgLevel: 0,
      avgPoints: 0,
      avgCompletionTime: 0,
      completionRate: 0,
      avgAccuracy: 0
    };
  }

  // Contagem por categoria acadêmica
  const students = participants.filter(p => p.profiles?.academic_stage === "ESTUDANTE").length;
  const residents = participants.filter(p => p.profiles?.academic_stage === "RESIDENTE").length;
  const specialists = participants.filter(p => p.profiles?.academic_stage === "ESPECIALISTA").length;

  // Médias de nível e pontos
  const avgLevel = Math.round(
    participants.reduce((sum, p) => sum + (p.profiles?.user_level || 1), 0) / total
  );
  
  const avgPoints = Math.round(
    participants.reduce((sum, p) => sum + (p.profiles?.total_points || 0), 0) / total
  );

  // Estatísticas de progresso
  const participantsWithProgress = participants.filter(p => p.progress);
  const completedParticipants = participantsWithProgress.filter(p => p.progress?.status === 'completed');
  
  const completionRate = participantsWithProgress.length > 0 
    ? Math.round((completedParticipants.length / participantsWithProgress.length) * 100)
    : 0;

  const avgCompletionTime = participantsWithProgress.length > 0
    ? Math.round(
        participantsWithProgress.reduce((sum, p) => sum + (p.progress?.time_spent_seconds || 0), 0) 
        / participantsWithProgress.length / 60
      )
    : 0;

  const avgAccuracy = participantsWithProgress.length > 0
    ? Math.round(
        participantsWithProgress.reduce((sum, p) => {
          const progress = p.progress!;
          return sum + (progress.cases_completed > 0 ? (progress.cases_correct / progress.cases_completed) * 100 : 0);
        }, 0) / participantsWithProgress.length
      )
    : 0;

  return {
    total,
    students,
    residents,
    specialists,
    avgLevel,
    avgPoints,
    avgCompletionTime,
    completionRate,
    avgAccuracy
  };
}