
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Sparkles, AlertCircle, X } from "lucide-react";
import { useRadBotChat } from "@/hooks/useRadBotChat";
import { useEducationalProtections } from "@/hooks/useEducationalProtections";
import { useToast } from "@/components/ui/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useResponsive } from "@/hooks/useResponsive";

interface RadBotChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RadBotChat({ isOpen, onClose }: RadBotChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useRadBotChat();
  const { checkRadBotLimit } = useEducationalProtections();
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const { isMobile, getChatSize } = useResponsive();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    // Verificação educacional invisível
    const limitCheck = checkRadBotLimit();
    if (!limitCheck.allowed) {
      toast({
        title: "Pausa recomendada",
        description: limitCheck.reason || "Você já usou o RadBot bastante hoje. Que tal praticar casos médicos?",
        variant: "default"
      });
      return;
    }

    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Card className={`${getChatSize()} flex flex-col shadow-2xl border-purple-200 bg-gradient-to-br from-white to-purple-50 z-50`}>
      <CardHeader className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg ${isMobile ? 'pb-2 px-3 py-2' : 'pb-3'}`}>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
            <Bot className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            {isMobile ? 'RadBot' : 'RadBot IA'}
            <Sparkles className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`bg-white/20 text-white ${isMobile ? 'text-xs px-2 py-1' : ''}`}>
              💰 {profile?.radcoin_balance || 0}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`text-white hover:bg-white/20 p-0 min-h-[44px] min-w-[44px] ${isMobile ? 'h-8 w-8' : 'h-6 w-6'} flex items-center justify-center`}
            >
              <X className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className={`flex-1 ${isMobile ? 'p-3' : 'p-4'}`}>
          <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            {messages.length === 0 && (
              <div className={`text-center text-gray-500 ${isMobile ? 'py-6' : 'py-8'}`}>
                <Bot className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} mx-auto mb-4 text-purple-400`} />
                <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Olá! Sou o RadBot, seu assistente médico IA.
                  <br />
                  Como posso ajudar com seus estudos hoje?
                </p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${isMobile ? 'gap-2' : 'gap-3'} ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-purple-500 text-white'
                }`}>
                  {message.type === 'user' ? <User className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} /> : <Bot className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />}
                </div>
                <div className={`flex-1 ${isMobile ? 'max-w-[85%]' : 'max-w-[90%]'} ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`inline-block ${isMobile ? 'p-2' : 'p-4'} rounded-lg ${isMobile ? 'text-xs' : 'text-sm'} ${isMobile ? 'leading-relaxed' : 'leading-relaxed'} break-words overflow-wrap-anywhere ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`} style={{ wordBreak: 'break-word' }}>
                    {message.content}
                  </div>
                  {message.cost && (
                    <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 mt-1`}>
                      Custo: {message.cost} RadCoins
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'}`}>
                <div className={`flex-shrink-0 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-purple-500 text-white flex items-center justify-center`}>
                  <Bot className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                </div>
                <div className="flex-1">
                  <div className={`inline-block ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-gray-100`}>
                    <div className="flex space-x-1">
                      <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-gray-400 rounded-full animate-bounce`}></div>
                      <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-gray-400 rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                      <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-gray-400 rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className={`${isMobile ? 'p-3' : 'p-4'} border-t bg-gray-50`}>
          <div className={`flex ${isMobile ? 'gap-2' : 'gap-2'}`}>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isMobile ? "Sua pergunta..." : "Digite sua pergunta médica..."}
              className={`resize-none ${isMobile ? 'min-h-[36px] max-h-[80px] text-sm' : 'min-h-[40px] max-h-[100px]'}`}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              className={`bg-purple-500 hover:bg-purple-600 min-h-[44px] min-w-[44px] ${isMobile ? 'px-3' : ''}`}
            >
              <Send className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            </Button>
          </div>
          <div className={`flex items-center justify-between mt-2 ${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500`}>
            <span>{isMobile ? '💰 ~5 RC/msg' : '💰 Custo: ~5 RadCoins por mensagem'}</span>
            <span className="flex items-center gap-1">
              <AlertCircle className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
              {isMobile ? 'Moderação' : 'Use com moderação'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
