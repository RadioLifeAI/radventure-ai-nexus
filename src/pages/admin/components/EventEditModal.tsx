
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type EventEditModalProps = {
  open: boolean;
  onClose: () => void;
  event: any;
  onSave: (updated: any) => void;
};

/** Form simples para edição - pode ser trocado por um form completo depois */
export default function EventEditModal({ open, onClose, event, onSave }: EventEditModalProps) {
  const [form, setForm] = React.useState<any>(event || {});

  React.useEffect(() => { setForm(event || {}); }, [event]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  if (!event) return null;
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg w-full p-6">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2 my-2">
          <input type="text" className="input w-full" name="name" value={form.name || ""} onChange={handleChange} placeholder="Nome" />
          <textarea className="input w-full" name="description" value={form.description || ""} onChange={handleChange} placeholder="Descrição" />
          <input type="number" className="input w-full" name="max_participants" value={form.max_participants || ""} onChange={handleChange} placeholder="Máx. participantes" />
          <input type="number" className="input w-full" name="prize_radcoins" value={form.prize_radcoins || ""} onChange={handleChange} placeholder="RadCoins" />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" type="button">Cancelar</Button>
            </DialogClose>
            <Button variant="default" type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
