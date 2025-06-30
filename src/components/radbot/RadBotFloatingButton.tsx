
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";
import { RadBotChat } from "./RadBotChat";
import { useAuth } from "@/hooks/useAuth";

export function RadBotFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Só mostrar para usuários autenticados
  if (!user) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 z-40 group"
        size="lg"
      >
        <div className="relative">
          <Bot className="h-6 w-6 text-white" />
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse" />
        </div>
        <span className="sr-only">Abrir RadBot AI</span>
      </Button>

      <RadBotChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
