
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { EventForm } from "./EventForm";

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
    const { id, ...rest } = values;
    const { error } = await supabase.from("events").update(rest).eq("id", id);
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao salvar evento", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Evento atualizado!", description: "As informações do evento foram salvas." });
      onSave({ ...event, ...rest });
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>
        <div className="p-2">
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
