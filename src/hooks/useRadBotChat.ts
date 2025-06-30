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
}

export function useRadBotChat() {
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
        content: '❌ Saldo insuficiente! Você precisa de 5 RadCoins para enviar uma mensagem. Acesse a loja para adquirir mais créditos.',
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
        timestamp: new Date()
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
          message: 'Seu report foi criado automaticamente pelo RadBot AI',
          priority: 'medium'
        });
      }

    } catch (error: any) {
      console.error('Erro no chat:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: `❌ Erro: ${error.message || 'Não foi possível processar sua mensagem'}`,
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
        response = `📊 **Suas Estatísticas:**
• Pontos Totais: ${profile?.total_points || 0}
• RadCoins: ${profile?.radcoin_balance || 0}
• Streak Atual: ${profile?.current_streak || 0} dias
• Especialidade: ${profile?.medical_specialty || 'Não informada'}`;
        break;
      case '/radcoins':
        response = `💰 **Sistema RadCoins:**
RadCoins são nossa moeda virtual! Use para:
• Chat com RadBot AI (5 RadCoins/msg)
• Comprar ajudas nos casos
• Acessar conteúdo premium

Ganhe RadCoins resolvendo casos e participando de eventos!`;
        break;
      case '/eventos':
        response = `🎯 **Sistema de Eventos:**
Participe de competições em tempo real!
• Rankings ao vivo
• Prêmios em RadCoins
• Desafios especiais
• Conquistas exclusivas

Acesse: Menu > Eventos`;
        break;
      case '/conquistas':
        response = `🏆 **Sistema de Conquistas:**
Desbloqueie badges e recompensas!
• Resolva casos consecutivos
• Mantenha streaks de login
• Participe de eventos
• Complete especialidades

Acesse: Menu > Conquistas`;
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
    
    // Mensagem de boas-vindas na primeira abertura
    if (!isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `🤖 Olá! Sou o RadBot AI, seu assistente especializado em radiologia médica.

**Posso te ajudar com:**
• Explicações sobre o RadVenture
• Conceitos de radiologia médica
• Dúvidas sobre funcionalidades
• Criar reports de problemas

**Comandos rápidos:**
/meus-stats • /radcoins • /eventos • /conquistas

**Custo:** 5 RadCoins por mensagem
**Seu saldo:** ${profile?.radcoin_balance || 0} RadCoins

Como posso te ajudar hoje? 🩺`,
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
