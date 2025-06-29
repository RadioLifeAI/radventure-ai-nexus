
import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { EventsNotificationSystem } from "./EventsNotificationSystem";

export function EventosHeaderActions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-3">
      <EventsNotificationSystem />
      <Button 
        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        onClick={() => navigate("/app/conquistas")}
      >
        <Trophy className="h-4 w-4 mr-2" />
        Conquistas
      </Button>
      {user && (
        <Button 
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          onClick={() => navigate("/admin/events/create")}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Criar Evento
        </Button>
      )}
      {!user && (
        <Button 
          variant="outline"
          className="text-white border-white hover:bg-white hover:text-blue-900"
          onClick={() => navigate("/login")}
        >
          Fazer Login
        </Button>
      )}
    </div>
  );
}
