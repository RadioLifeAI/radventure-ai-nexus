
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  X, 
  Trash2, 
  Coins, 
  User,
  FileText,
  Sparkles
} from "lucide-react";
import { useRadBotChat } from "@/hooks/useRadBotChat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RadBotChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RadBotChat({ isOpen, onClose }: RadBotChatProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isLoading, 
    radcoinBalance, 
    sendMessage, 
    createReport, 
    clearChat 
  } = useRadBotChat();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    await sendMessage(inputMessage.trim());
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateReport = async () => {
    if (!reportTitle.trim() || !reportDescription.trim()) return;
    
    await createReport(reportTitle, reportDescription);
    setReportTitle("");
    setReportDescription("");
    setShowReportDialog(false);
  };

  const quickCommands = [
    { command: "/meus-stats", label: "Minhas Estatísticas", icon: "📊" },
    { command: "/radcoins", label: "Como ganhar RadCoins", icon: "💰" },
    { command: "/eventos", label: "Eventos Ativos", icon: "🏆" },
    { command: "/conquistas", label: "Conquistas", icon: "⭐" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <CardTitle className="text-lg font-bold">RadBot AI 🤖</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-yellow-500 text-white">
              <Coins className="h-3 w-3 mr-1" />
              {radcoinBalance}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">Olá! Sou o RadBot AI! 🩻</h3>
                <p className="text-sm mb-4">
                  Posso te ajudar com:
                </p>
                <div className="text-left space-y-2 text-xs">
                  <p>• Dúvidas sobre o app</p>
                  <p>• Conceitos de radiologia</p>
                  <p>• Seu progresso no game</p>
                  <p>• Criar reports e feedback</p>
                </div>
                <p className="text-xs mt-4 bg-yellow-100 p-2 rounded">
                  💰 Cada pergunta custa 1 RadCoin
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.message_type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.message_type === 'assistant' && (
                      <Avatar className="h-8 w-8 bg-blue-500">
                        <AvatarFallback>
                          <Bot className="h-4 w-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[75%] p-3 rounded-lg ${
                        message.message_type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.radcoins_cost > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                          <Coins className="h-3 w-3" />
                          -{message.radcoins_cost}
                        </div>
                      )}
                    </div>

                    {message.message_type === 'user' && (
                      <Avatar className="h-8 w-8 bg-green-500">
                        <AvatarFallback>
                          <User className="h-4 w-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start gap-3">
                    <Avatar className="h-8 w-8 bg-blue-500">
                      <AvatarFallback>
                        <Bot className="h-4 w-4 text-white animate-pulse" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white border shadow-sm p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        RadBot AI pensando...
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Quick Commands */}
          {messages.length === 0 && (
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Comandos rápidos:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickCommands.map((cmd) => (
                  <Button
                    key={cmd.command}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 justify-start"
                    onClick={() => setInputMessage(cmd.command)}
                  >
                    {cmd.icon} {cmd.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2 mb-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta... (1 RadCoin)"
                disabled={isLoading || radcoinBalance < 1}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || radcoinBalance < 1}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportDialog(true)}
                  className="text-xs h-6 px-2"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Criar Report
                </Button>
                
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-xs h-6 px-2"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
              
              <span>
                {radcoinBalance < 1 ? "Sem RadCoins suficientes" : `${radcoinBalance} RadCoins`}
              </span>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="px-4 py-2 bg-gray-100 text-xs text-gray-600 text-center border-t">
            ⚠️ Conteúdo gerado por IA - Não substitui orientação médica
          </div>
        </CardContent>
      </Card>

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Criar Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Título do report"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
              <textarea
                className="w-full p-3 border rounded-md resize-none"
                rows={4}
                placeholder="Descreva o problema ou sugestão..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateReport}
                  disabled={!reportTitle.trim() || !reportDescription.trim()}
                  className="flex-1"
                >
                  Enviar Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReportDialog(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
