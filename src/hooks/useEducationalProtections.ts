
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { checkRateLimit, generateStudyRecommendations, createEducationalAlert } from '@/utils/notifications';

export function useEducationalProtections() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Gerar recomendações educacionais semanalmente
    const lastRecommendation = localStorage.getItem(`last_recommendation_${user.id}`);
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    if (!lastRecommendation || parseInt(lastRecommendation) < weekAgo) {
      setTimeout(() => {
        generateStudyRecommendations(user.id);
        localStorage.setItem(`last_recommendation_${user.id}`, Date.now().toString());
      }, 5000); // Delay de 5s para não interferir no carregamento
    }

    // Monitorar sessões muito longas (mais de 2 horas)
    const sessionStart = Date.now();
    const warningShown = localStorage.getItem(`session_warning_${new Date().toDateString()}`);
    
    const sessionWarningTimer = setTimeout(() => {
      if (!warningShown) {
        createEducationalAlert(user.id, 'long_session',
          '⏰ Que tal fazer uma pausa?',
          'Você está estudando há mais de 2 horas. Lembre-se: pausas regulares ajudam na retenção do conhecimento!'
        );
        localStorage.setItem(`session_warning_${new Date().toDateString()}`, 'shown');
      }
    }, 2 * 60 * 60 * 1000); // 2 horas

    return () => {
      clearTimeout(sessionWarningTimer);
    };
  }, [user?.id]);

  // Funções de verificação que serão usadas pelos componentes
  const checkRadBotLimit = () => {
    if (!user?.id) return { allowed: false, reason: 'Usuário não autenticado' };
    return checkRateLimit(user.id, 'radbot');
  };

  const checkAITutorLimit = () => {
    if (!user?.id) return { allowed: false, reason: 'Usuário não autenticado' };
    return checkRateLimit(user.id, 'ai_tutor');
  };

  const checkCaseAnswerPattern = () => {
    if (!user?.id) return { allowed: true };
    return checkRateLimit(user.id, 'case_answer');
  };

  const checkHelpAidUsage = () => {
    if (!user?.id) return { allowed: false, reason: 'Usuário não autenticado' };
    return checkRateLimit(user.id, 'help_aid');
  };

  return {
    checkRadBotLimit,
    checkAITutorLimit,
    checkCaseAnswerPattern,
    checkHelpAidUsage
  };
}
