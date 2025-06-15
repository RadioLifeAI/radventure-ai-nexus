
import React from "react";
import { Lightbulb, BadgeCheck } from "lucide-react";

export function CaseFormGamifiedHelpers({ form }: { form: any }) {
  // Mostrar dicas/badges conforme campos são preenchidos
  const badges = [];
  if (form.ai_hint_enabled) badges.push({ text: "Usando IA para dicas", icon: <Lightbulb size={14} /> });
  if (form.answer_feedbacks && form.answer_feedbacks.filter((x:string)=>x.length>0).length === 4) badges.push({ text: "Feedback completo", icon: <BadgeCheck size={13} /> });
  if (form.explanation && form.explanation.length > 30) badges.push({ text: "Explicação detalhada", icon: <BadgeCheck size={13} /> });

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap mb-2 gap-2">
      {badges.map((b, idx)=>(
        <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded animate-fade-in">
          {b.icon}{b.text}
        </span>
      ))}
    </div>
  );
}
