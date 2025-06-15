
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react"; // Para referência ícones
import { Sparkles, Sword, Smile, Frown, Lightbulb } from "lucide-react"; // Emojis animados, pode customizar
import clsx from "clsx";

// MOCK de caso único para visual
const caso = {
  id: 42,
  title: "Caso de Neuro #2",
  category: "Neuro",
  imageUrl: "/lovable-uploads/9f1aaa04-f7a1-4a04-93fe-aa5c6edabeef.png",
  history: "Trabalhador da construção civil. Atingido na região temporal por objeto pesado em queda há 2 horas. Perda transitória de consciência (LOC), acordou confuso, mas agora apresenta piora progressiva do nível de consciência.",
  patient: "Paciente masculino, 40 anos.",
  question: "Qual é o achado de imagem mais urgente neste cenário?",
  options: [
    "Hematoma subdural",
    "Fratura do osso temporal",
    "AVC isquêmico agudo",
    "Efeito de massa tumoral"
  ],
  correctIndex: 0,
  explanationOK: "Perfeito! Hematoma subdural é o achado de maior risco imediato neste contexto de trauma craniano, justificando intervenção rápida.",
  explanationFAIL: "O achado mais urgente é o hematoma subdural, pois explica o quadro neurológico em evolução e risco de vida.",
};

const FEEDBACKS = [
  { title: "Muito Bem! 🎉", icon: <Sparkles className="text-lg text-green-500 inline ml-1" /> },
  { title: "Ótimo raciocínio! 👍", icon: <Smile className="text-lg text-green-500 inline ml-1" /> },
  { title: "Quase lá! Não desista! 💪", icon: <Sword className="text-lg text-yellow-600 inline ml-1" /> },
  { title: "Continue praticando! 🔄", icon: <Frown className="text-lg text-red-500 inline ml-1" /> }
];

function randomFeedback(acertou: boolean) {
  if (acertou) {
    const ok = FEEDBACKS.slice(0, 2);
    return ok[Math.floor(Math.random() * ok.length)];
  }
  return FEEDBACKS[2 + Math.floor(Math.random() * 2)];
}

export default function CasoUsuarioView() {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const acertou = selected === caso.correctIndex && answered && selected !== null;
  const feedbackMsg = randomFeedback(acertou);
  const showFeedback = answered && selected !== null;

  return (
    <div className="flex flex-col md:flex-row gap-6 px-4 py-6 md:py-10 bg-[#f5f7fd] min-h-screen animate-fade-in">
      {/* Esquerda: Imagem */}
      <div className="md:w-[350px] flex-shrink-0 flex flex-col items-center">
        <div className="rounded-xl bg-black overflow-hidden shadow-md border mb-2">
          <img src={caso.imageUrl} alt="Imagem do caso" className="object-contain max-h-[320px] min-w-[280px]" />
        </div>
        <div className="flex gap-2 mt-2 mb-6">
          <Button size="sm" variant="outline" title="Zoom In"><ArrowDown style={{ rotate: "180deg" }} /></Button>
          <Button size="sm" variant="outline" title="Zoom Out"><ArrowDown /></Button>
          <Button size="sm" variant="outline" title="Fullscreen">⛶</Button>
        </div>
      </div>

      {/* Meio */}
      <div className="flex-1 max-w-2xl">
        {/* Título e categoria */}
        <div className="flex gap-2 items-center mb-2">
          <span className="inline-flex items-center bg-white text-cyan-900 rounded-full shadow px-4 py-1 text-lg font-bold">
            🧠 {caso.title}
          </span>
          <span className="bg-cyan-50 border border-cyan-200 rounded px-2 py-1 text-cyan-700 text-xs font-semibold ml-2 flex items-center gap-1">
            <BookIcon className="w-4 h-4" /> {caso.category}
          </span>
        </div>

        {/* História clínica */}
        <section className="bg-green-50 border-l-4 border-green-500 rounded-xl shadow px-6 py-4 mb-3">
          <div className="text-green-900 font-semibold mb-1 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-green-500" /> História Clínica
          </div>
          <div className="text-green-900 text-sm mb-2">{caso.history}</div>
          <div className="bg-white border rounded px-3 py-1.5 text-xs text-blue-900 underline cursor-pointer w-fit">Dados do Paciente<br /><span className="text-[13px]">{caso.patient}</span></div>
        </section>

        {/* Pergunta e Opções */}
        <section className="bg-white rounded-lg shadow px-5 py-4 mb-4">
          <div className="font-bold text-cyan-900 text-base mb-2">Pergunta Principal</div>
          <div className="mb-2 text-[16px] font-medium">{caso.question}</div>
          <div>
            <div className="flex flex-col gap-3 mb-4">
              {caso.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={clsx(
                    "w-full text-left px-4 py-3 rounded shadow border font-medium transition",
                    !answered
                      ? "hover:bg-cyan-50 border-cyan-200"
                      : idx === caso.correctIndex
                        ? "bg-green-50 border-green-400 text-green-800 font-bold"
                        : idx === selected
                          ? "bg-red-50 border-red-400 text-red-600 font-bold"
                          : "opacity-70"
                  )}
                  disabled={answered}
                  tabIndex={0}
                  onClick={() => setSelected(idx)}
                  aria-label={`Selecionar alternativa ${String.fromCharCode(65+idx)}`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + idx)})</span> {opt}
                </button>
              ))}
            </div>
            <Button
              disabled={selected === null || answered}
              onClick={() => setAnswered(true)}
              className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold shadow"
              size="lg"
            >
              Responder
            </Button>
          </div>
        </section>

        {/* Feedback Gamificado */}
        {showFeedback && (
          <section
            className={clsx(
              "mt-2 p-5 rounded-xl shadow border text-base animate-scale-in",
              acertou
                ? "bg-green-50 border-green-600 text-green-900"
                : "bg-yellow-50 border-yellow-600 text-yellow-900"
            )}
          >
            <div className="flex items-center gap-2 mb-2 text-xl font-bold">
              {feedbackMsg.title} {feedbackMsg.icon}
            </div>
            <div>
              {acertou ? (
                <span>
                  <b>✅ Resposta correta!</b>
                  <div className="mt-1 text-sm">{caso.explanationOK}</div>
                </span>
              ) : (
                <span>
                  <b>❌ Resposta incorreta.</b>
                  <div className="mt-1 text-sm">{caso.explanationFAIL}</div>
                </span>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Sidebar: Ajudas e Tutor AI */}
      <aside className="w-full md:w-[282px] flex flex-col gap-4 mt-8 md:mt-0">
        {/* Ajudas Disponíveis */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-xl shadow px-4 py-4 mb-2">
          <div className="text-yellow-800 font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" /> Ajudas Disponíveis
          </div>
          <div className="flex gap-3 mb-1">
            <Button variant="outline" className="flex-1 flex flex-col items-center py-3 gap-1 cursor-not-allowed opacity-60" disabled>
              <span className="text-pink-600"><Sword className="w-5 h-5 inline" /></span>
              <span className="text-xs font-bold">Eliminar Opção</span>
              <span className="text-[12px] text-gray-500">0</span>
            </Button>
            <Button variant="outline" className="flex-1 flex flex-col items-center py-3 gap-1 cursor-not-allowed opacity-60" disabled>
              <span className="text-blue-600"><ArrowDown className="w-5 h-5 inline" /></span>
              <span className="text-xs font-bold">Pular Questão</span>
              <span className="text-[12px] text-gray-500">0</span>
            </Button>
          </div>
          <div className="text-xs text-yellow-800 mt-2">
            <b>💡 Ganhe mais ajudas completando seu perfil ou evoluindo de título!</b>
          </div>
        </section>
        {/* Tutor AI */}
        <section className="bg-purple-50 border border-purple-200 rounded-xl shadow px-4 py-4 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-violet-500 font-bold text-lg"><Sparkles className="w-5 h-5 inline" /></span>
            <span className="font-semibold text-violet-900">Tutor AI</span>
          </div>
          <Button variant="secondary" className="opacity-70 cursor-not-allowed mt-2 mb-2" disabled>
            Tutor AI
          </Button>
          <span className="text-xs text-violet-600">0 disponíveis</span>
        </section>
      </aside>
    </div>
  );
}

// Ícone categoria livro
function BookIcon(props: any) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M4 4a2 2 0 01 2-2h10a1 1 0 0 1 1 1v13a1 1 0 01-1 1H6a2 2 0 01-2-2V4zm2 0v12h10V4H6z" />
    </svg>
  );
}

