
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { HelpCircle, BookOpen, Brain, User, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface CasePreviewModalProps {
  open: boolean;
  onClose: () => void;
  caseId?: string | null;
  formData?: any;
  categories?: any[];
  difficulties?: any[];
}

export function CasePreviewModal({
  open,
  onClose,
  caseId,
  formData,
  categories: externalCategories,
  difficulties: externalDifficulties,
}: CasePreviewModalProps) {
  const { data: caseData, isLoading } = useQuery({
    queryKey: ["case-preview", caseId],
    queryFn: async () => {
      if (!caseId) return null;
      
      const { data, error } = await supabase
        .from("medical_cases")
        .select("*")
        .eq("id", caseId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId && open && !formData,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["medical-specialties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_specialties")
        .select("*");
      
      if (error) throw error;
      return data;
    },
    enabled: !externalCategories,
  });

  const { data: difficulties = [] } = useQuery({
    queryKey: ["difficulties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("difficulties")
        .select("*");
      
      if (error) throw error;
      return data;
    },
    enabled: !externalDifficulties,
  });

  // Use either fetched data or form data
  const actualCaseData = formData || caseData;
  const actualCategories = externalCategories || categories;
  const actualDifficulties = externalDifficulties || difficulties;

  if (!actualCaseData && !isLoading) {
    return null;
  }

  // Helper para label da especialidade
  function getCategoryName(categories: any[], id: number) {
    return categories.find((c) => c.id === id)?.name || "";
  }
  
  function getDifficultyDesc(difficulties: any[], level: number) {
    return difficulties.find((d) => d.level === level)?.description || level?.toString() || "";
  }

  const form = actualCaseData || {};
  const category = getCategoryName(actualCategories, form.category_id);
  const difficulty = getDifficultyDesc(actualDifficulties, form.difficulty_level);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-[#f5f8fd] shadow-xl">
        {/* HEADER */}
        <div className="rounded-t-lg bg-white border-b flex flex-col md:flex-row items-center px-7 py-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="rounded-lg bg-cyan-100 p-2">
              <Brain className="text-cyan-800" size={32} />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 leading-tight">
                {form.title || "Novo Caso Clínico"}
              </div>
              <div className="flex items-center gap-1 text-xs text-cyan-800 mt-1">
                <BookOpen size={16} />
                <span>{category || "Especialidade indefinida"}</span>
                {difficulty && (
                  <span className="ml-2 bg-cyan-100 rounded px-2 text-cyan-800 font-bold">
                    {difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogClose asChild>
            <button className="ml-auto p-2 rounded-full hover:bg-gray-100 transition" aria-label="Fechar">
              <span className="sr-only">Fechar</span>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M6 6l8 8M14 6l-8 8" stroke="#2c2c2c" strokeWidth={2} strokeLinecap="round"/>
              </svg>
            </button>
          </DialogClose>
        </div>
        {/* CORPO */}
        <div className="flex flex-col md:flex-row gap-6 px-6 py-5">
          {/* COLUNA 1: IMAGEM */}
          <div className="md:w-72 flex-shrink-0 flex flex-col items-center">
            {form.image_url && Array.isArray(form.image_url) && form.image_url[0] ? (
              <img
                src={form.image_url[0]}
                alt="Imagem do caso"
                className="w-64 h-64 object-cover rounded-lg border shadow mb-3 bg-white"
              />
            ) : (
              <div className="flex items-center justify-center w-64 h-64 rounded-lg bg-slate-100 border text-slate-400 text-xs">
                Sem imagem anexada
              </div>
            )}
          </div>
          {/* COLUNA 2: CARDS DE INFO */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* HISTÓRIA CLÍNICA */}
            <div className="rounded-lg border border-green-200 bg-green-50/70 py-2 px-4 mb-1">
              <div className="flex items-center gap-2 text-green-900 font-semibold mb-1">
                <User size={19} className="text-green-700" />
                História Clínica
              </div>
              <div className="text-sm mb-2">{form.patient_clinical_info || "Informação clínica não disponível"}</div>
              <div className="bg-green-100 px-2 py-1 rounded text-xs text-green-900 max-w-fit">
                {`Paciente ${form.patient_gender?.toLowerCase() || "--"}, ${form.patient_age || "--"} anos.`}
              </div>
            </div>
            {/* DURAÇÃO SINTOMAS / ACHADOS */}
            <div className="flex flex-wrap gap-3">
              <span className="text-xs px-2 py-1 bg-cyan-50 rounded border border-cyan-100 text-cyan-900">{form.findings || "Achados não informados"}</span>
              {form.symptoms_duration && (
                <span className="text-xs px-2 py-1 bg-cyan-50 rounded border border-cyan-100 text-cyan-900">
                  Duração: {form.symptoms_duration}
                </span>
              )}
            </div>
            {/* PERGUNTA PRINCIPAL */}
            <div className="mt-2 rounded-lg border bg-blue-50/70 border-blue-200">
              <div className="flex gap-2 items-center px-4 pt-3 pb-1">
                <HelpCircle className="text-blue-700" size={18} />
                <span className="font-semibold text-blue-900">Pergunta Principal</span>
              </div>
              <div className="px-4 py-2 text-base font-medium text-blue-900">
                {form.main_question || <span className="text-blue-400">Sem pergunta preenchida.</span>}
              </div>
              {/* Alternativas de resposta */}
              <div className="px-4 pb-4">
                <div className="text-xs text-slate-600 mb-2 font-semibold">Selecione sua resposta:</div>
                <ol className="space-y-2">
                  {(form.answer_options || []).map((alt: string, idx: number) => (
                    <li key={idx}>
                      <button
                        type="button"
                        disabled
                        className={cn(
                          "flex items-center w-full rounded-lg border border-slate-200 px-3 py-2  text-left",
                          "bg-white opacity-85",
                          !alt ? "italic text-slate-400" : "text-slate-900"
                        )}
                        tabIndex={-1}
                      >
                        <span className="font-bold w-8">{String.fromCharCode(65 + idx)})</span>
                        <span className="ml-1">{alt || "vazio"}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            {/* EXPLICAÇÃO DETALHADA */}
            <div className="mt-1 rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3">
              <div className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-1">
                <BookOpen size={16} className="text-blue-800" />
                Explicação Detalhada
              </div>
              <div className="text-sm text-blue-950 whitespace-pre-line">{form.explanation || <em>Sem explicação preenchida.</em>}</div>
            </div>
          </div>
          {/* COLUNA 3: BLOCO AJUDAS (Visual, sem lógica funcional, só para simular preview)*/}
          <div className="hidden lg:flex flex-col gap-2 min-w-[220px]">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 mb-1">
              <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                <Lightbulb size={18} className="text-yellow-700" />
                Ajudas Disponíveis
              </div>
              <div className="flex gap-2 mb-1">
                <button
                  disabled
                  className="text-xs px-3 py-1 rounded border border-yellow-300 bg-white flex items-center gap-1"
                >
                  <span className="text-yellow-700">⚡</span>
                  Eliminar Opção
                  <span className="ml-1 text-yellow-600 font-bold text-[10px]">∞</span>
                </button>
                <button
                  disabled
                  className="text-xs px-3 py-1 rounded border border-yellow-300 bg-white flex items-center gap-1"
                >
                  <span className="text-yellow-800">⏭</span>
                  Pular Questão
                  <span className="ml-1 text-yellow-700 font-bold text-[10px]">∞</span>
                </button>
              </div>
              <div className="text-[11px] text-yellow-600 mt-1">
                <span>Visualização administrativa.<br />Ajudas ilimitadas</span>
              </div>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
              <div className="flex items-center gap-2 text-purple-800 font-semibold mb-2">
                <Brain size={16} className="text-purple-700" />
                Tutor AI
              </div>
              <div className="text-xs text-purple-700">Tutor AI ativado na pré-visualização</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
