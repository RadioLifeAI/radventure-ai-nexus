
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  rarity: string;
  points_required: number;
  conditions: any;
  rewards: any;
  is_active: boolean;
}

export interface UserAchievementProgress {
  id: string;
  achievement_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at: string | null;
  achievement: Achievement;
}

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProgress, setUserProgress] = useState<UserAchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [user]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      console.log("🏅 Buscando conquistas reais do sistema");

      // Buscar todas as conquistas ativas (dados reais)
      const { data: achievementsData, error: achievementsError } = await supabase
        .from("achievement_system")
        .select("*")
        .eq("is_active", true)
        .order("points_required", { ascending: true });

      if (achievementsError) throw achievementsError;

      setAchievements(achievementsData || []);
      console.log("🏅 Conquistas carregadas:", achievementsData?.length || 0);

      // Se o usuário estiver logado, buscar progresso real
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from("user_achievements_progress")
          .select(`
            *,
            achievement_system (*)
          `)
          .eq("user_id", user.id);

        if (progressError) throw progressError;

        // Mapear os dados para o formato correto
        const mappedProgress = (progressData || []).map(progress => ({
          ...progress,
          achievement: progress.achievement_system
        }));

        setUserProgress(mappedProgress);
        console.log("🏅 Progresso de conquistas carregado:", mappedProgress.length);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar conquistas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletedAchievements = () => {
    return userProgress.filter(p => p.is_completed);
  };

  const getInProgressAchievements = () => {
    return userProgress.filter(p => !p.is_completed && p.current_progress > 0);
  };

  const getUserAchievementProgress = (achievementId: string) => {
    return userProgress.find(p => p.achievement_id === achievementId);
  };

  return {
    achievements,
    userProgress,
    loading,
    getCompletedAchievements,
    getInProgressAchievements,
    getUserAchievementProgress,
    refetch: fetchAchievements
  };
}
