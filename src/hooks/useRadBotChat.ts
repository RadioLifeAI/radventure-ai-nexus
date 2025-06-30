
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/components/ui/use-toast";

export interface ChatMessage {
  id: string;
  message_type: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  radcoins_cost: number;
  tokens_used: number;
}

export interface ChatSession {
  id: string;
  session_name: string;
  total_messages: number;
  total_radcoins_spent: number;
  created_at: string;
}

export function useRadBotChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [radcoinBalance, setRadcoinBalance] = useState(0);

  useEffect(() => {
    if (user) {
      initializeSession();
      fetchRadcoinBalance();
    }
  }, [user]);

  const fetchRadcoinBalance = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('radcoin_balance')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setRadcoinBalance(data.radcoin_balance);
    }
  };

  const initializeSession = async () => {
    if (!user) return;

    // Buscar sessão ativa ou criar nova
    let { data: sessions } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    let sessionId: string;

    if (sessions && sessions.length > 0) {
      sessionId = sessions[0].id;
      setCurrentSession(sessions[0]);
    } else {
      // Criar nova sessão
      const { data: newSession, error } = await supabase
        .from('ai_chat_sessions')
        .insert([{
          user_id: user.id,
          session_name: `Chat - ${new Date().toLocaleDateString()}`
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return;
      }

      sessionId = newSession.id;
      setCurrentSession(newSession);
    }

    // Carregar mensagens da sessão
    const { data: chatMessages } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (chatMessages) {
      setMessages(chatMessages.map(msg => ({
        id: msg.id,
        message_type: msg.message_type as 'user' | 'assistant' | 'system',
        content: msg.content,
        created_at: msg.created_at,
        radcoins_cost: msg.radcoins_cost,
        tokens_used: msg.tokens_used
      })));
    }
  };

  const sendMessage = async (message: string) => {
    if (!user || !currentSession || isLoading) return;

    // Verificar saldo de RadCoins
    if (radcoinBalance < 1) {
      toast({
        title: "RadCoins Insuficientes! 💰",
        description: "Você precisa de pelo menos 1 RadCoin para usar o RadBot AI.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Adicionar mensagem do usuário à interface
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      message_type: 'user',
      content: message,
      created_at: new Date().toISOString(),
      radcoins_cost: 1,
      tokens_used: 0
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Obter contexto atual
      const currentContext = {
        currentPage: window.location.pathname,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/functions/v1/radbot-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          message,
          sessionId: currentSession.id,
          context: currentContext
        })
      });

      const result = await response.json();

      if (response.status === 402) {
        // Insufficient credits
        toast({
          title: "RadCoins Insuficientes! 💰",
          description: "Você precisa de mais RadCoins para continuar usando o RadBot AI.",
          variant: "destructive"
        });
        setMessages(prev => prev.slice(0, -1)); // Remove user message
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Erro na comunicação com o RadBot AI');
      }

      // Adicionar resposta do assistente
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        message_type: 'assistant',
        content: result.response,
        created_at: new Date().toISOString(),
        radcoins_cost: 0,
        tokens_used: result.tokensUsed || 0
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Atualizar saldo de RadCoins
      setRadcoinBalance(prev => prev - 1);

      // Mostrar sugestão de report se detectado
      if (result.suggestReport) {
        toast({
          title: "Deseja registrar um report? 📋",
          description: "Detectei que você pode ter uma sugestão ou problema. Posso ajudar a registrar!",
          duration: 5000
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro no RadBot AI 🤖",
        description: "Não foi possível processar sua mensagem. Tente novamente!",
        variant: "destructive"
      });
      setMessages(prev => prev.slice(0, -1)); // Remove user message
    } finally {
      setIsLoading(false);
    }
  };

  const createReport = async (title: string, description: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ai_generated_reports')
        .insert([{
          user_id: user.id,
          title,
          description,
          report_type: 'ai_generated'
        }]);

      if (error) throw error;

      toast({
        title: "Report Criado! ✅",
        description: "Seu feedback foi registrado e será analisado pela equipe.",
      });

    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Erro ao criar report",
        description: "Não foi possível registrar seu feedback. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    currentSession,
    isLoading,
    radcoinBalance,
    sendMessage,
    createReport,
    clearChat,
    refreshBalance: fetchRadcoinBalance
  };
}
