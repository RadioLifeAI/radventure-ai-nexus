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
      <DialogContent className="max-w-4xl w-full p-0 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>
        {/* Form Content with Scroll */}
        <div className="overflow-y-auto px-4 pb-1 pt-2 flex-1 max-h-[75vh]">
          <EventForm
            mode="edit"
            initialValues={event}
            loading={loading}
            onSubmit={handleUpdate}
            onCancel={onClose}
          />
        </div>
        {/* Footer agora é só no rodapé do modal, sem sticky */}
        <DialogFooter className="bg-white px-4 py-3 mt-0 border-t z-10">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="event-form-in-modal" disabled={loading}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
