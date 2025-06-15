
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/Loader";
import { toast } from "@/components/ui/use-toast";

type CaseEditAdminModalProps = {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
  onSaved: () => void;
};

/**
 * Modal para editar um caso médico exist.
 */
export function CaseEditAdminModal({ open, onClose, caseId, onSaved }: CaseEditAdminModalProps) {
  const [initialLoading, setInitialLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && caseId) {
      setInitialLoading(true);
      supabase
        .from("medical_cases")
        .select("*")
        .eq("id", caseId)
        .maybeSingle()
        .then(({ data, error }) => {
          setForm(data || {});
          setError(error ? "Erro ao carregar caso." : null);
          setInitialLoading(false);
        });
    } else {
      setForm(null);
      setError(null);
    }
  }, [open, caseId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("medical_cases")
      .update({
        title: form.title,
        specialty: form.specialty,
        modality: form.modality,
        findings: form.findings,
        main_question: form.main_question,
        explanation: form.explanation,
        updated_at: new Date().toISOString(),
      })
      .eq("id", caseId);

    setSaving(false);
    if (!error) {
      toast({ title: "Caso atualizado!" });
      onSaved();
      onClose();
    } else {
      toast({ title: "Falha ao salvar.", variant: "destructive" });
      setError("Falha ao salvar.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl min-h-[380px]">
        <DialogHeader>
          <DialogTitle>Editar Caso Médico</DialogTitle>
        </DialogHeader>
        {initialLoading ? (
          <div className="flex items-center justify-center min-h-[150px]"><Loader /></div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <Input name="title" value={form?.title || ""} onChange={handleChange} placeholder="Título" required />
          <Input name="specialty" value={form?.specialty || ""} onChange={handleChange} placeholder="Especialidade" />
          <Input name="modality" value={form?.modality || ""} onChange={handleChange} placeholder="Modalidade" />
          <Input name="findings" value={form?.findings || ""} onChange={handleChange} placeholder="Achados" />
          <Input name="main_question" value={form?.main_question || ""} onChange={handleChange} placeholder="Pergunta principal" />
          <textarea className="border rounded px-2 py-1" name="explanation" value={form?.explanation || ""} onChange={handleChange} placeholder="Explicação" rows={3} />
          <div className="flex gap-2 mt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
