
import React from "react";
import { Button } from "@/components/ui/button";

const exampleTemplates = [
  {
    name: "Caso Emergência",
    desc: "Enfoque em TC/RX, paciente agudo, explicação curta, alternativas objetivas.",
    fill: (setForm: any) => setForm((p: any)=> ({
      ...p,
      modality: "Tomografia Computadorizada (TC)",
      difficulty_level: "2",
      points: "20",
      main_question: "Qual conduta inicial adequada para este quadro agudo?",
    }))
  },
  {
    name: "Desafio Didático",
    desc: "Didático, foco em explicação, feedback nas alternativas, quadro clínico rico.",
    fill: (setForm: any)=> setForm((p: any)=> ({
      ...p,
      difficulty_level: "1",
      points: "10",
      patient_clinical_info: "Paciente do sexo masculino, 30 anos, quadro subagudo.",
      explanation: "Integração de achados e contexto clínico leva ao diagnóstico.",
    }))
  },
  {
    name: "Especialista Avançado",
    desc: "Modalidade especializada, alta dificuldade, alternativas complexas.",
    fill: (setForm: any)=> setForm((p: any)=> ({
      ...p,
      difficulty_level: "4",
      points: "50",
      ai_tutor_level: "detalhado",
      main_question: "Qual diagnóstico diferencial mais provável para este padrão raro?",
    }))
  }
];

export function CaseTemplateChooser({ setForm }: { setForm: any }) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="mb-3">
      <Button type="button" size="sm" variant="secondary" onClick={()=>setShow(true)}>
        Usar Template Inteligente
      </Button>
      {show && (
        <div className="fixed inset-0 z-30 bg-black/30 flex justify-center items-center animate-fade-in" onClick={()=>setShow(false)}>
          <div className="bg-white rounded shadow-lg max-w-md w-full p-5 relative" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold mb-2">Escolha um template</h3>
            <ul>
              {exampleTemplates.map((tpl, idx)=>(
                <li key={tpl.name} className="mb-3">
                  <Button size="sm" variant="outline"
                    onClick={()=>{
                      tpl.fill(setForm);
                      setShow(false);
                    }}
                  >
                    {tpl.name}
                  </Button>
                  <span className="ml-2 text-xs text-gray-600">{tpl.desc}</span>
                </li>
              ))}
            </ul>
            <button className="absolute top-2 right-3 text-cyan-700" onClick={()=>setShow(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
