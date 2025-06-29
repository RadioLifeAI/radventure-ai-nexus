
import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { createNotification } from "@/utils/notifications";

export function useNotificationTriggers() {
  const { user } = useAuth();

  // Função para disparar notificação de caso completado
  const triggerCaseCompletedNotification = async (caseData: {
    caseId: string;
    caseName: string;
    isCorrect: boolean;
    points: number;
  }) => {
    if (!user) return;

    const title = caseData.isCorrect ? 
      "🎯 Caso Resolvido Corretamente!" : 
      "📚 Caso Completado";
    
    const message = caseData.isCorrect ?
      `Parabéns! Você resolveu "${caseData.caseName}" e ganhou ${caseData.points} pontos!` :
      `Você completou "${caseData.caseName}". Continue praticando para melhorar!`;

    await createNotification({
      userId: user.id,
      type: 'case_completed',
      title,
      message,
      priority: caseData.isCorrect ? 'medium' : 'low',
      actionUrl: `/app/casos/${caseData.caseId}`,
      actionLabel: 'Revisar Caso',
      metadata: {
        case_id: caseData.caseId,
        is_correct: caseData.isCorrect,
        points_earned: caseData.points
      }
    });
  };

  // Função para disparar notificação de compra RadCoin
  const triggerRadCoinPurchaseNotification = async (purchaseData: {
    amount: number;
    itemName: string;
    newBalance: number;
  }) => {
    if (!user) return;

    await createNotification({
      userId: user.id,
      type: 'radcoin_purchase',
      title: '💰 RadCoins Utilizados',
      message: `Você gastou ${purchaseData.amount} RadCoins em "${purchaseData.itemName}". Saldo atual: ${purchaseData.newBalance}`,
      priority: 'low',
      actionUrl: '/app/estatisticas',
      actionLabel: 'Ver Saldo',
      metadata: {
        amount_spent: purchaseData.amount,
        item_purchased: purchaseData.itemName,
        new_balance: purchaseData.newBalance
      }
    });
  };

  // Função para disparar notificação de jornada completada
  const triggerJourneyCompletedNotification = async (journeyData: {
    journeyId: string;
    journeyName: string;
    casesCompleted: number;
    totalCases: number;
  }) => {
    if (!user) return;

    await createNotification({
      userId: user.id,
      type: 'journey_completed',
      title: '🎊 Jornada Concluída!',
      message: `Parabéns! Você completou a jornada "${journeyData.journeyName}" (${journeyData.casesCompleted}/${journeyData.totalCases} casos)`,
      priority: 'high',
      actionUrl: '/app/jornadas',
      actionLabel: 'Ver Jornadas',
      metadata: {
        journey_id: journeyData.journeyId,
        cases_completed: journeyData.casesCompleted,
        total_cases: journeyData.totalCases
      }
    });
  };

  // Função para disparar notificação de marco de performance
  const triggerPerformanceMilestoneNotification = async (milestoneData: {
    type: 'cases_solved' | 'accuracy_rate' | 'study_time';
    milestone: number;
    currentValue: number;
  }) => {
    if (!user) return;

    const titles = {
      'cases_solved': '🏆 Marco de Casos!',
      'accuracy_rate': '🎯 Precisão Incrível!',
      'study_time': '⏰ Tempo de Estudo!'
    };

    const messages = {
      'cases_solved': `Você resolveu ${milestoneData.milestone} casos! Continue assim!`,
      'accuracy_rate': `Sua precisão atingiu ${milestoneData.milestone}%! Excelente trabalho!`,
      'study_time': `Você estudou por ${milestoneData.milestone} horas! Dedicação exemplar!`
    };

    await createNotification({
      userId: user.id,
      type: 'performance_milestone',
      title: titles[milestoneData.type],
      message: messages[milestoneData.type],
      priority: 'high',
      actionUrl: '/app/estatisticas',
      actionLabel: 'Ver Estatísticas',
      metadata: {
        milestone_type: milestoneData.type,
        milestone_value: milestoneData.milestone,
        current_value: milestoneData.currentValue
      }
    });
  };

  // Função para disparar lembrete de estudo
  const triggerStudyReminderNotification = async () => {
    if (!user) return;

    await createNotification({
      userId: user.id,
      type: 'study_reminder',
      title: '📚 Lembrete de Estudo',
      message: 'Que tal resolver alguns casos hoje? Mantenha sua sequência ativa!',
      priority: 'low',
      actionUrl: '/app/casos',
      actionLabel: 'Estudar Agora',
      metadata: {
        reminder_type: 'daily_study'
      }
    });
  };

  // Função para disparar dica de aprendizado
  const triggerLearningTipNotification = async (tipData: {
    category: string;
    tip: string;
  }) => {
    if (!user) return;

    await createNotification({
      userId: user.id,
      type: 'learning_tip',
      title: '💡 Dica de Aprendizado',
      message: tipData.tip,
      priority: 'low',
      actionUrl: '/app/casos',
      actionLabel: 'Praticar',
      metadata: {
        tip_category: tipData.category,
        tip_content: tipData.tip
      }
    });
  };

  return {
    triggerCaseCompletedNotification,
    triggerRadCoinPurchaseNotification,
    triggerJourneyCompletedNotification,
    triggerPerformanceMilestoneNotification,
    triggerStudyReminderNotification,
    triggerLearningTipNotification
  };
}
