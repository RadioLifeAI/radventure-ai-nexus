
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot, User, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useRadBotChat } from '@/hooks/useRadBotChat';
import { useUserProfile } from '@/hooks/useUserProfile';

interface RadBotChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RadBotChat({ isOpen, onClose }: RadBotChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, processCommand, clearChat, hasEnoughCredits } = useRadBotChat();
  const { profile } = useUserProfile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Processar comandos primeiro
    if (inputMessage.startsWith('/')) {
      const processed = processCommand(inputMessage);
      if (processed) {
        setInputMessage('');
        return;
      }
    }

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-end p-4 z-50">
      <div className="w-full max-w-md h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Bot className="h-6 w-6" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold">RadBot AI</h3>
                <p className="text-xs opacity-90">
                  Saldo: {profile?.radcoin_balance || 0} RadCoins • 5 RC/msg
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-white hover:bg-white/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[85%] p-3 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-100'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.type === 'assistant' && (
                    <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="h-4 w-4 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      {message.cost && (
                        <div className="text-xs bg-white/20 px-2 py-1 rounded">
                          -{message.cost} RC
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-gray-100 p-3">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">RadBot AI está pensando...</span>
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Warning sem créditos */}
        {!hasEnoughCredits && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-red-600 text-sm text-center">
              ⚠️ Saldo insuficiente! Você precisa de 5 RadCoins para enviar mensagens.
            </p>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasEnoughCredits ? "Digite sua mensagem..." : "Sem créditos suficientes"}
              disabled={isLoading || !hasEnoughCredits}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim() || !hasEnoughCredits}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Comandos rápidos */}
          <div className="mt-2 flex flex-wrap gap-1">
            {['/meus-stats', '/radcoins', '/eventos', '/conquistas'].map((cmd) => (
              <Button
                key={cmd}
                variant="outline"
                size="sm"
                onClick={() => setInputMessage(cmd)}
                className="text-xs h-6"
                disabled={!hasEnoughCredits}
              >
                {cmd}
              </Button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-yellow-50 text-xs text-center text-yellow-800">
          ⚠️ Informações educacionais. Não substitui consulta médica profissional.
        </div>
      </div>
    </div>
  );
}
