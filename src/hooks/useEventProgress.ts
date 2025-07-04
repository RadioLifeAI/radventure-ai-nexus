import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

export interface EventProgress {
  id: string;
  user_id: string;
  event_id: string;
  cases_completed: number;
  cases_correct: number;
  current_score: number;
  time_spent_seconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  current_case_index: number;
  started_at: string;
  completed_at?: string;
  last_activity_at: string;
}

export function useEventProgress(eventId: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<EventProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!eventId || !user) return;

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from("user_event_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("event_id", eventId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setProgress(data as EventProgress);
      } catch (error: any) {
        console.error("Erro ao buscar progresso:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [eventId, user]);

  const startParticipation = async () => {
    if (!user || !eventId) return null;

    try {
      setSubmitting(true);
      
      const { data, error } = await supabase.rpc('start_event_participation', {
        p_event_id: eventId
      });

      if (error) throw error;

      const result = data as any;
      if (!result.success) {
        toast({
          title: "Erro ao iniciar participação",
          description: result.error,
          variant: "destructive"
        });
        return null;
      }

      // Recarregar progresso
      const { data: newProgress } = await supabase
        .from("user_event_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("event_id", eventId)
        .single();

      setProgress(newProgress as EventProgress);
      
      toast({
        title: "Participação Iniciada!",
        description: "Você entrou no evento com sucesso.",
        className: "bg-green-50 border-green-200"
      });

      return newProgress;
    } catch (error: any) {
      console.error("Erro ao iniciar participação:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const updateProgress = async (isCorrect: boolean, pointsEarned: number, timeSpent: number) => {
    if (!user || !eventId) return null;

    try {
      setSubmitting(true);

      const { data, error } = await supabase.rpc('update_event_progress', {
        p_event_id: eventId,
        p_case_correct: isCorrect,
        p_points_earned: pointsEarned,
        p_time_spent: timeSpent
      });

      if (error) throw error;

      const result = data as any;
      if (!result.success) {
        throw new Error(result.error);
      }

      // Atualizar estado local
      if (progress) {
        const updatedProgress = {
          ...progress,
          cases_completed: result.cases_completed,
          cases_correct: result.cases_correct,
          current_score: result.new_score,
          time_spent_seconds: progress.time_spent_seconds + timeSpent,
          current_case_index: progress.current_case_index + 1,
          last_activity_at: new Date().toISOString()
        };
        setProgress(updatedProgress);
      }

      return {
        ...result,
        accuracy: progress ? Math.round((result.cases_correct / result.cases_completed) * 100) : 0
      };
    } catch (error: any) {
      console.error("Erro ao atualizar progresso:", error);
      toast({
        title: "Erro ao salvar progresso",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const finishEvent = async () => {
    if (!progress) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("user_event_progress")
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", progress.id);

      if (error) throw error;

      setProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        completed_at: new Date().toISOString()
      } : null);

      toast({
        title: "Evento Finalizado!",
        description: `Você completou o evento com ${progress.current_score} pontos!`,
        className: "bg-green-50 border-green-200"
      });

    } catch (error: any) {
      console.error("Erro ao finalizar evento:", error);
      toast({
        title: "Erro ao finalizar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    progress,
    loading,
    submitting,
    startParticipation,
    updateProgress,
    finishEvent,
    hasStarted: progress?.status === 'in_progress',
    isCompleted: progress?.status === 'completed'
  };
}