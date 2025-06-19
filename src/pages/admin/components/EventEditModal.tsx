
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { EventForm } from "./EventForm";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit } from "lucide-react";

type EventEditModalProps = {
  open: boolean;
  onClose: () => void;
  event: any;
  onSave: (updated: any) => void;
};

export default function EventEditModal({ open, onClose, event, onSave }: EventEditModalProps) {
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  async function handleUpdate(values: any) {
    setLoading(true);
    try {
      const { id, ...rest } = values;
      const { error } = await supabase.from("events").update(rest).eq("id", id);
      
      if (error) throw error;
      
      toast({ 
        title: "✅ Evento atualizado com sucesso!", 
        description: `"${values.name}" foi salvo com todas as modificações.`,
        className: "bg-green-50 border-green-200"
      });
      
      onSave({ ...event, ...rest });
      onClose();
    } catch (error: any) {
      toast({ 
        title: "❌ Erro ao salvar evento", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-700",
      SCHEDULED: "bg-blue-100 text-blue-700",
      ACTIVE: "bg-green-100 text-green-700",
      FINISHED: "bg-purple-100 text-purple-700",
      CANCELLED: "bg-red-100 text-red-700"
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-5xl w-full p-0 max-h-[95vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit className="h-6 w-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl font-bold text-blue-800">
                  Editar Evento
                </DialogTitle>
                <p className="text-sm text-blue-600 mt-1">
                  Editando: <span className="font-medium">{event.name}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
              <div className="text-right text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="h-3 w-3" />
                  {formatDate(event.scheduled_start)}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {event.id.slice(0, 8)}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        {/* Form Content com Scroll Otimizado */}
        <div className="overflow-y-auto px-6 py-4 flex-1 bg-gray-50">
          <EventForm
            mode="edit"
            initialValues={event}
            loading={loading}
            onSubmit={handleUpdate}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
