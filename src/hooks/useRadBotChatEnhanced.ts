
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { createNotification } from '@/utils/notifications';

interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  cost?: number;
  stats?: {
    casesResolved: number;
    accuracy: number;
    achievements: number;
    streak: number;
  };
}

export function useRadBotChatEnhanced() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { profile, refreshProfile } = useUserProfile();

  const sendMessage = useCallback(async (message: string) => {
    if (!user || !message.trim()) return;

    // Verificar saldo antes de enviar
    if ((profile?.radcoin_balance || 0) < 5) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: '❌ **Saldo insuficiente!** \n\nVocê precisa de **5 RadCoins** para enviar uma mensagem.\n\n💰 **Como ganhar RadCoins:**\n• Resolva casos médicos (+1-3 RC)\n• Participe de eventos (até +50 RC)\n• Complete conquistas (até +25 RC)\n• Mantenha streak de login (+5-15 RC)\n\n🛒 Acesse a **loja RadCoin** no menu do usuário!',
        type: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: message,
      type: 'user',
      timestamp: new Date(),
      cost: 5
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('radbot-chat', {
        body: {
          message,
          userId: user.id
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        content: data.response,
        type: 'assistant',
        timestamp: new Date(),
        stats: data.userStats
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Atualizar perfil para refletir novo saldo
      refreshProfile();

      // Criar report se necessário
      if (data.shouldCreateReport) {
        await supabase.from('user_reports').insert({
          user_id: user.id,
          title: 'Report criado via RadBot AI',
          description: message,
          report_type: 'ai_generated'
        });

        await createNotification({
          userId: user.id,
          type: 'report_update',
          title: '📋 Report Criado',
          message: 'Seu report foi criado automaticamente pelo RadBot AI. Nossa equipe analisará em breve.',
          priority: 'medium'
        });
      }

    } catch (error: any) {
      console.error('Erro no chat:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: `❌ **Erro no RadBot AI**\n\n${error.message || 'Não foi possível processar sua mensagem'}\n\n🔄 Tente novamente em alguns momentos.\n\n💡 Se o problema persistir, relate usando: *"Estou com problema no chat"*`,
        type: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, refreshProfile]);

  const processCommand = useCallback((command: string) => {
    let response = '';
    
    switch (command) {
      case '/meus-stats':
        response = `📊 **Análise Completa do seu Progresso:**

**🎯 Desempenho Geral:**
• **Pontos Totais:** ${profile?.total_points || 0}
• **RadCoins:** ${profile?.radcoin_balance || 0}
• **Streak Atual:** ${profile?.current_streak || 0} dias consecutivos
• **Especialidade:** ${profile?.medical_specialty || 'Não informada'}

**📈 Recomendações Personalizadas:**
${(profile?.total_points || 0) < 100 ? '• Resolva mais casos para ganhar experiência\n• Foque em casos básicos primeiro' : '• Experimente casos mais desafiadores\n• Participe de eventos competitivos'}

**💡 Próximos Passos:**
• ${(profile?.current_streak || 0) < 7 ? 'Mantenha login diário para bonus de streak' : 'Parabéns pelo streak consistente!'}
• ${(profile?.radcoin_balance || 0) < 50 ? 'Acumule mais RadCoins para usar funcionalidades premium' : 'Você tem um bom saldo de RadCoins!'}`;
        break;

      case '/radcoins':
        response = `💰 **Sistema RadCoins - Moeda Virtual:**

**🎯 Como Usar:**
• **Chat RadBot AI:** 5 RadCoins/mensagem
• **Ajudas nos casos:** 10-25 RadCoins
• **Conteúdo premium:** 15-50 RadCoins
• **Dicas especiais:** 5-15 RadCoins

**💎 Como Ganhar:**
• **Casos corretos:** +1-3 RadCoins
• **Eventos competitivos:** +10-50 RadCoins  
• **Login diário:** +5-15 RadCoins (streak)
• **Conquistas:** +5-25 RadCoins
• **Desafios especiais:** +20-100 RadCoins

**📊 Seu Saldo Atual:** ${profile?.radcoin_balance || 0} RadCoins

**💰 Precisa de mais?** Resolva casos ou participe de eventos!`;
        break;

      case '/eventos':
        response = `🎯 **Sistema de Eventos Competitivos:**

**🏆 Tipos de Eventos:**
• **Quiz Cronometrado:** Resolva casos contra o tempo
• **Maratona de Casos:** Resistência e precisão
• **Desafio Temático:** Especialidades específicas
• **Torneio Eliminatório:** Competição direta

**🎁 Recompensas:**
• **1º Lugar:** 100-200 RadCoins + Badge Ouro
• **Top 3:** 50-100 RadCoins + Badge Prata/Bronze  
• **Top 10:** 25-50 RadCoins + Badge Participação
• **Todos:** XP bonus e conquistas especiais

**📅 Como Participar:**
1. Acesse **Menu > Eventos**
2. Escolha evento ativo
3. Clique em **"Participar Agora"**
4. Compita em tempo real!

**⚡ Dica:** Eventos são a forma mais rápida de ganhar RadCoins!`;
        break;

      case '/conquistas':
        response = `🏆 **Sistema de Conquistas e Badges:**

**🎖️ Categorias de Conquistas:**
• **Iniciante:** Primeiros passos (5-10 RadCoins)
• **Especialista:** Domínio de áreas (15-25 RadCoins)
• **Veterano:** Experiência avançada (25-50 RadCoins)
• **Lenda:** Feitos épicos (50-100 RadCoins)

**🎯 Exemplos de Conquistas:**
• **Primeiro Caso:** Resolva seu primeiro caso
• **Streak Master:** 30 dias consecutivos
• **Radiologista:** 100 casos de radiologia
• **Competidor:** Participe de 10 eventos
• **Perfecionista:** 95%+ de acerto

**⭐ Benefícios:**
• RadCoins automáticos ao desbloquear
• Títulos especiais no perfil
• Badges visíveis no ranking
• Acesso a conteúdo exclusivo

**📍 Ver Progresso:** Menu > Conquistas`;
        break;

      case '/help':
        response = `🤖 **Guia Completo do RadBot AI:**

**❓ O que posso fazer:**
1. **Explicar o RadVenture:** funcionamento, pontuação, ranking
2. **Ensinar radiologia:** conceitos, diagnósticos, achados
3. **Analisar seu progresso:** estatísticas e recomendações

**⚡ Comandos Rápidos:**
• \`/meus-stats\` - Análise completa do progresso
• \`/radcoins\` - Sistema de moeda virtual  
• \`/eventos\` - Competições e rankings
• \`/conquistas\` - Badges e recompensas
• \`/help\` - Este guia

**💡 Exemplos de Perguntas:**
• "Como funciona o sistema de pontos?"
• "O que é pneumotórax?"
• "Como participar de eventos?"
• "Quais são os achados de AVC?"

**⚠️ Importante:** Cada mensagem custa 5 RadCoins
**📋 Problemas?** Digite: "Estou com problema..."`;
        break;

      default:
        return null;
    }

    const commandMessage: ChatMessage = {
      id: `command-${Date.now()}`,
      content: response,
      type: 'assistant',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, commandMessage]);
    return true;
  }, [profile]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    
    // Mensagem de boas-vindas melhorada na primeira abertura
    if (!isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `🤖 **Olá! Sou o RadBot AI, seu tutor especializado em radiologia médica.**

**👋 Bem-vindo(a), ${profile?.full_name?.split(' ')[0] || 'Estudante'}!**

**🎯 Posso te ajudar com:**
• **Explicações sobre o RadVenture** (como funciona, pontuação, ranking)
• **Conceitos de radiologia médica** (diagnósticos, achados, casos)  
• **Análise do seu progresso** (estatísticas e recomendações personalizadas)
• **Criação automática de reports** (quando você relatar problemas)

**⚡ Comandos Rápidos:**
\`/meus-stats\` • \`/radcoins\` • \`/eventos\` • \`/conquistas\` • \`/help\`

**💰 Custo:** 5 RadCoins por mensagem
**💎 Seu saldo:** ${profile?.radcoin_balance || 0} RadCoins

**🩺 Como posso te ajudar hoje?**

*Exemplo: "Como funcionam os eventos?" ou "O que é pneumotórax?"*`,
        type: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, profile]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    isOpen,
    sendMessage,
    processCommand,
    toggleChat,
    clearChat,
    hasEnoughCredits: (profile?.radcoin_balance || 0) >= 5
  };
}
