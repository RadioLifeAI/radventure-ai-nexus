import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 'event_starting' | 'achievement_unlocked' | 'ranking_update' | 'new_event' | 'reminder' | 'radcoin_reward' | 'streak_milestone' | 'daily_login_bonus' | 'case_milestone' | 'report_update' | 'educational_alert' | 'abuse_warning' | 'study_recommendation';
export type NotificationPriority = 'low' | 'medium' | 'high';

interface CreateNotificationProps {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  priority = 'medium',
  actionUrl,
  actionLabel,
  metadata = {}
}: CreateNotificationProps) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        priority,
        action_url: actionUrl,
        action_label: actionLabel,
        metadata
      }]);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return { success: false, error };
  }
}

// Sistema de Rate Limiting Invisível
const userActivity = new Map<string, {
  radBotMessages: { count: number; lastReset: number };
  aiTutorUses: { count: number; lastUse: number };
  caseAnswers: { times: number[]; suspicious: boolean };
  helpAidsUsage: { elimination: number; skip: number; ai: number; lastReset: number };
}>();

const RATE_LIMITS = {
  radBotMessagesPerHour: 15,
  aiTutorCooldownMs: 30000, // 30 segundos
  minCaseAnswerTimeMs: 5000, // 5 segundos mínimo
  maxCaseAnswerTimeMs: 300000, // 5 minutos máximo
  maxHelpAidsPerHour: 20
};

export function checkRateLimit(userId: string, action: 'radbot' | 'ai_tutor' | 'case_answer' | 'help_aid'): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  if (!userActivity.has(userId)) {
    userActivity.set(userId, {
      radBotMessages: { count: 0, lastReset: now },
      aiTutorUses: { count: 0, lastUse: 0 },
      caseAnswers: { times: [], suspicious: false },
      helpAidsUsage: { elimination: 0, skip: 0, ai: 0, lastReset: now }
    });
  }

  const activity = userActivity.get(userId)!;

  switch (action) {
    case 'radbot':
      // Reset contador se passou 1 hora
      if (now - activity.radBotMessages.lastReset > 60 * 60 * 1000) {
        activity.radBotMessages = { count: 0, lastReset: now };
      }
      
      if (activity.radBotMessages.count >= RATE_LIMITS.radBotMessagesPerHour) {
        return { allowed: false, reason: 'Muitas mensagens por hora. Descanse um pouco! 😊' };
      }
      
      activity.radBotMessages.count++;
      break;

    case 'ai_tutor':
      if (now - activity.aiTutorUses.lastUse < RATE_LIMITS.aiTutorCooldownMs) {
        return { allowed: false, reason: 'Aguarde um momento antes de usar o Tutor IA novamente.' };
      }
      
      activity.aiTutorUses.lastUse = now;
      break;

    case 'case_answer':
      // Detectar padrões suspeitos de velocidade
      activity.caseAnswers.times.push(now);
      
      // Manter apenas últimas 10 respostas
      if (activity.caseAnswers.times.length > 10) {
        activity.caseAnswers.times = activity.caseAnswers.times.slice(-10);
      }
      
      // Verificar se as últimas 5 respostas foram muito rápidas
      if (activity.caseAnswers.times.length >= 5) {
        const last5 = activity.caseAnswers.times.slice(-5);
        const intervals = [];
        for (let i = 1; i < last5.length; i++) {
          intervals.push(last5[i] - last5[i-1]);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        if (avgInterval < RATE_LIMITS.minCaseAnswerTimeMs) {
          activity.caseAnswers.suspicious = true;
          // Criar notificação educacional
          createEducationalAlert(userId, 'study_pace', 
            'Que tal desacelerar um pouco? 🤔',
            'Detectamos que você está respondendo muito rápido. Lembre-se: o foco é aprender, não apenas acumular pontos!'
          );
        }
      }
      break;

    case 'help_aid':
      // Reset contador se passou 1 hora
      if (now - activity.helpAidsUsage.lastReset > 60 * 60 * 1000) {
        activity.helpAidsUsage = { elimination: 0, skip: 0, ai: 0, lastReset: now };
      }
      
      const totalAids = activity.helpAidsUsage.elimination + activity.helpAidsUsage.skip + activity.helpAidsUsage.ai;
      if (totalAids >= RATE_LIMITS.maxHelpAidsPerHour) {
        createEducationalAlert(userId, 'help_dependency',
          'Cuidado com a dependência de ajudas! 💡',
          'Você está usando muitas ajudas. Tente confiar mais no seu conhecimento!'
        );
      }
      break;
  }

  return { allowed: true };
}

// Sistema de Alertas Educacionais
export async function createEducationalAlert(
  userId: string, 
  alertType: string, 
  title: string, 
  message: string,
  actionUrl?: string
) {
  // Evitar spam de alertas - máximo 1 por tipo por dia
  const today = new Date().toDateString();
  const alertKey = `${userId}_${alertType}_${today}`;
  
  if (localStorage.getItem(alertKey)) {
    return; // Já enviou hoje
  }

  await createNotification({
    userId,
    type: 'educational_alert',
    title,
    message,
    priority: 'medium',
    actionUrl: actionUrl || '/app/casos',
    actionLabel: 'Ver Sugestões',
    metadata: { alert_type: alertType, date: today }
  });

  localStorage.setItem(alertKey, 'sent');
}

// Sistema de Detecção de Padrões Suspeitos
export function detectSuspiciousPattern(userId: string, activityData: any) {
  const patterns = {
    onlyEasyCases: false,
    sameAnswerRepeated: false,
    unusualTiming: false,
    helpAidsAbuse: false
  };

  // Implementar detecção de padrões aqui
  // Por enquanto, apenas log para monitoramento
  console.log('Monitoring user activity:', userId, activityData);

  return patterns;
}

// Sistema de Recomendações Educacionais
export async function generateStudyRecommendations(userId: string) {
  try {
    // Buscar histórico do usuário
    const { data: history, error } = await supabase
      .from('user_case_history')
      .select(`
        *,
        medical_cases(category_id, modality, difficulty_level)
      `)
      .eq('user_id', userId)
      .order('answered_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    if (!history || history.length === 0) return;

    // Análise de padrões de aprendizado
    const analytics = analyzeStudyPatterns(history);
    
    // Gerar recomendações baseadas na análise
    if (analytics.needsDiversification) {
      await createEducationalAlert(userId, 'diversify_study',
        '🌟 Que tal explorar novas áreas?',
        `Você tem focado muito em ${analytics.dominantSpecialty}. Experimente outras especialidades para ampliar seu conhecimento!`,
        '/app/casos'
      );
    }

    if (analytics.difficultyStagnation) {
      await createEducationalAlert(userId, 'challenge_yourself',
        '📈 Hora de se desafiar!',
        'Você está dominando casos mais fáceis. Que tal tentar casos mais complexos?',
        '/app/casos'
      );
    }
  } catch (error) {
    console.error('Erro ao gerar recomendações:', error);
  }
}

function analyzeStudyPatterns(history: any[]) {
  const specialtyCount = new Map();
  const difficultyCount = new Map();
  
  history.forEach(item => {
    if (item.medical_cases) {
      const specialty = item.medical_cases.category_id;
      const difficulty = item.medical_cases.difficulty_level;
      
      specialtyCount.set(specialty, (specialtyCount.get(specialty) || 0) + 1);
      difficultyCount.set(difficulty, (difficultyCount.get(difficulty) || 0) + 1);
    }
  });

  const totalCases = history.length;
  const dominantSpecialty = [...specialtyCount.entries()].reduce((a, b) => a[1] > b[1] ? a : b)?.[0];
  const dominantSpecialtyPercent = (specialtyCount.get(dominantSpecialty) || 0) / totalCases;
  
  const easyPercent = (difficultyCount.get('easy') || 0) / totalCases;

  return {
    needsDiversification: dominantSpecialtyPercent > 0.7,
    difficultyStagnation: easyPercent > 0.8,
    dominantSpecialty: dominantSpecialty,
    totalAnalyzed: totalCases
  };
}

// Função para criar notificação para todos os usuários
export async function createNotificationForAllUsers({
  type,
  title,
  message,
  priority = 'medium',
  actionUrl,
  actionLabel,
  metadata = {}
}: Omit<CreateNotificationProps, 'userId'>) {
  try {
    // Buscar todos os usuários ativos
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('type', 'USER');

    if (usersError) throw usersError;

    if (!users || users.length === 0) return { success: true };

    // Criar notificação para cada usuário
    const notifications = users.map(user => ({
      user_id: user.id,
      type,
      title,
      message,
      priority,
      action_url: actionUrl,
      action_label: actionLabel,
      metadata
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar notificações em massa:', error);
    return { success: false, error };
  }
}

// Função específica para notificações de report
export async function createReportNotification({
  userId,
  reportId,
  title,
  message,
  priority = 'medium'
}: {
  userId: string;
  reportId: string;
  title: string;
  message: string;
  priority?: NotificationPriority;
}) {
  return createNotification({
    userId,
    type: 'report_update',
    title,
    message,
    priority,
    metadata: { report_id: reportId }
  });
}

// Função para marcar notificação como lida
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return { success: false, error };
  }
}

// Função para obter estatísticas de notificações
export async function getNotificationStats() {
  try {
    const { data: totalSent, error: sentError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' });

    const { data: totalRead, error: readError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('is_read', true);

    if (sentError || readError) throw sentError || readError;

    const sentCount = totalSent?.length || 0;
    const readCount = totalRead?.length || 0;
    const openRate = sentCount > 0 ? Math.round((readCount / sentCount) * 100) : 0;

    return {
      success: true,
      stats: {
        totalSent: sentCount,
        totalRead: readCount,
        openRate
      }
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return { success: false, error };
  }
}
