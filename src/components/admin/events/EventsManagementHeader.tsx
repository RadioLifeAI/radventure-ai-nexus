
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Sparkles, Trophy, Users, Zap } from "lucide-react";

interface EventsManagementHeaderProps {
  totalEvents?: number;
  activeEvents?: number;
  onCreateNew: () => void;
}

export function EventsManagementHeader({ totalEvents = 0, activeEvents = 0, onCreateNew }: EventsManagementHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white mb-6">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative px-8 py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
              <Calendar className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                Gestão de Eventos
                <Sparkles className="h-8 w-8 text-yellow-300" />
              </h1>
              <p className="text-orange-100 text-lg">
                Gerencie eventos gamificados e competições de radiologia
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge className="bg-yellow-500/80 text-white px-3 py-1">
                  <Trophy className="h-4 w-4 mr-1" />
                  {totalEvents} eventos totais
                </Badge>
                <Badge className="bg-orange-500/80 text-white px-3 py-1">
                  <Zap className="h-4 w-4 mr-1" />
                  {activeEvents} ativos
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Button 
              onClick={onCreateNew}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Criar Evento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
