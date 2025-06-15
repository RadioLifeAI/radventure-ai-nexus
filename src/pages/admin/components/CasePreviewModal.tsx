
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { BadgeHelpCircle } from "lucide-react";

interface CasePreviewModalProps {
  open: boolean;
  onClose: () => void;
  form: any;
  categories: any[];
  difficulties: any[];
}

export function CasePreviewModal({ open, onClose, form, categories, difficulties }: CasePreviewModalProps) {
  const category = categories.find(c => String(c.id) === form.category_id)?.name || "";
  const difficulty = difficulties.find(d => String(d.level) === String(form.difficulty_level))?.description || form.difficulty_level || "";
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Pré-visualização do Caso
            <BadgeHelpCircle className="inline-block ml-2 text-cyan-600" size={20} />
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col items-center">
            {form.image_url ? (
              <img src={form.image_url} alt="Imagem do caso" className="w-44 h-44 object-cover rounded mb-4" />
            ) : (
              <span className="text-xs text-muted-foreground italic">Sem imagem anexada</span>
            )}
          </div>
          <div className="flex-1">
            <Table>
              <TableBody>
                <TableRow><TableCell className="font-bold">Categoria</TableCell><TableCell>{category}</TableCell></TableRow>
                <TableRow><TableCell className="font-bold">Dificuldade</TableCell><TableCell>{difficulty}</TableCell></TableRow>
                <TableRow><TableCell className="font-bold">Diagnóstico (interno)</TableCell><TableCell>{form.title}</TableCell></TableRow>
                <TableRow><TableCell className="font-bold">Achados</TableCell><TableCell>{form.findings}</TableCell></TableRow>
                <TableRow><TableCell className="font-bold">Resumo Clínico</TableCell><TableCell>{form.patient_clinical_info}</TableCell></TableRow>
                <TableRow><TableCell className="font-bold">Idade</TableCell><TableCell>{form.patient_age}</TableCell></TableRow>
                <TableRow><TableCell className="font-bold">Gênero</TableCell><TableCell>{form.patient_gender}</TableCell></TableRow>
                <TableRow><TableCell className="font-bold">Pergunta</TableCell><TableCell>{form.main_question}</TableCell></TableRow>
                <TableRow>
                  <TableCell className="font-bold">Alternativas</TableCell>
                  <TableCell>
                    <ol type="A" className="list-decimal pl-5">
                      {form.answer_options.map((alt: string, idx: number) => (
                        <li key={idx}><span className={form.correct_answer_index === idx ? "font-bold text-green-600" : ""}>{alt || <em>vazio</em>}</span></li>
                      ))}
                    </ol>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Explicação</TableCell>
                  <TableCell>{form.explanation}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <DialogClose asChild>
            <button className="bg-cyan-700 hover:bg-cyan-900 text-white px-4 py-2 rounded font-semibold">Fechar Pré-visualização</button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
