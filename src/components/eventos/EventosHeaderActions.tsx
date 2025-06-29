
import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { EventsNotificationSystem } from "./EventsNotificationSystem";

export function EventosHeaderActions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminCheckLoading } = useAdminCheck();

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
