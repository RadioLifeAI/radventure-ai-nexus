
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles, Sword, Smile, Frown, Lightbulb, Book } from "lucide-react";
import clsx from "clsx";
import { useShuffledAnswers } from "@/hooks/useShuffledAnswers";
import { Loader } from "@/components/Loader";
import { getLetter } from "@/utils/quiz";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// FEEDBACKS GAMIFICADOS
const FEEDBACKS = [
  { title: "Muito Bem! 🎉", icon: <Sparkles className="text-lg text-green-500 inline ml-1" /> },
  { title: "Ótimo raciocínio! 👍", icon: <Smile className="text-lg text-green-500 inline ml-1" /> },
  { title: "Quase lá! Não desista! 💪", icon: <Sword className="text-lg text-yellow-600 inline ml-1" /> },
  { title: "Continue praticando! 🔄", icon: <Frown className="text-lg text-red-500 inline ml-1" /> }
];

function randomFeedback(acertou: boolean) {
  if (acertou) {
    // Pick between first two feedbacks for correct answer
    const ok = FEEDBACKS.slice(0, 2);
    return ok[Math.floor(Math.random() * ok.length)];
  }
  // Pick between last two feedbacks for incorrect answer
  return FEEDBACKS[2 + Math.floor(Math.random() * 2)];
}

type CasoUsuarioViewProps = {
  idProp?: string;
  isAdminView?: boolean;
};

export default function CasoUsuarioView(props: CasoUsuarioViewProps) {
  const urlParams = useParams();
  const id = props.idProp || urlParams.id;
  const [caso, setCaso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCaso() {
      setLoading(true);
      setError(null);
      setCaso(null);

      const { data, error } = await supabase
        .from("medical_cases")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setError("Erro ao carregar caso.");
        setLoading(false);
        return;
      }
      if (!data) {
        setError("Caso não encontrado.");
        setLoading(false);
        return;
      }
      setCaso(data);
      setLoading(false);
    }
    if (id) fetchCaso();
  }, [id]);

  const shuffled = useShuffledAnswers(caso);

  const correctIdx = shuffled?.correctIndex ?? caso?.correct_answer_index;
  const acertou = selected === correctIdx && answered && selected !== null;
  const feedbackMsg = randomFeedback(acertou);
  const showFeedback = answered && selected !== null;

  let caseImages: Array<{ url: string; legend?: string }> = [];
  try {
    caseImages = Array.isArray(caso?.image_url)
      ? caso.image_url
      : typeof caso?.image_url === "string" && caso.image_url?.startsWith("[")
        ? JSON.parse(caso.image_url)
        : !!caso?.image_url ? [{ url: caso.image_url }] : [];
  } catch {
    caseImages = !!caso?.image_url ? [{ url: caso.image_url }] : [];
  }

  // Layout containers refinados:
  return (
    <div className="flex flex-col md:flex-row gap-2 px-2 py-3 md:py-6 bg-[#f5f7fd] min-h-screen animate-fade-in relative">
      {/* Coluna Esquerda: Imagem + ajudas */}
      <div className="w-full md:w-[225px] flex-shrink-0 flex flex-col items-center gap-2">
        <div
          className="rounded-xl bg-black overflow-hidden shadow border mb-1 flex items-center justify-center"
          style={{ minHeight: 120, maxHeight: 230, width: "100%", maxWidth: 205 }}
        >
          {loading ? (
            <Loader />
          ) : caseImages.length > 0 ? (
            <Carousel className="w-full max-w-[205px]">
              <CarouselContent>
                {caseImages.map((img, idx) => (
                  <CarouselItem key={idx}>
                    <img
                      src={img.url}
                      alt={`Imagem do caso ${idx + 1}`}
                      className="object-contain max-h-[215px] min-w-[150px] rounded"
                    />
                    {answered && img.legend && (
                      <div className="text-xs text-center text-blue-900 mt-2 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                        {img.legend}
                      </div>
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <div className="flex flex-col items-center justify-center w-[160px] h-[120px] gap-2">
              <Book className="w-8 h-8 text-gray-400 opacity-60" />
              <span className="text-xs text-gray-500">Sem imagem</span>
            </div>
          )}
        </div>
        {!loading && (
          <div className="flex gap-1 mt-1 mb-2">
            <Button size="sm" variant="outline" title="Zoom In"><ArrowDown style={{ rotate: "180deg" }} /></Button>
            <Button size="sm" variant="outline" title="Zoom Out"><ArrowDown /></Button>
            <Button size="sm" variant="outline" title="Fullscreen">⛶</Button>
          </div>
        )}
        {/* Ajudas Disponíveis */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-xl shadow px-2 py-2 mb-1 w-full">
          <div className="text-yellow-800 font-semibold mb-1 flex items-center gap-1 text-sm">
            <Lightbulb className="w-4 h-4 text-yellow-500" /> Ajudas
          </div>
          <div className="flex gap-2 mb-1">
            <Button variant="outline" className="flex-1 flex flex-col items-center py-2 gap-1 cursor-not-allowed opacity-60 text-xs" disabled>
              <span className="text-pink-600"><Sword className="w-4 h-4 inline" /></span>
              <span>Eliminar</span>
              <span className="text-[11px] text-gray-500">{caso?.max_elimination ?? 0}</span>
            </Button>
            <Button variant="outline" className="flex-1 flex flex-col items-center py-2 gap-1 cursor-not-allowed opacity-60 text-xs" disabled>
              <span className="text-blue-600"><ArrowDown className="w-4 h-4 inline" /></span>
              <span>Pular</span>
              <span className="text-[11px] text-gray-500">{caso?.can_skip ? 1 : 0}</span>
            </Button>
          </div>
        </section>
        {/* Tutor AI compacto */}
        <section className="bg-purple-50 border border-purple-200 rounded-xl shadow px-2 py-2 w-full flex flex-col items-center">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-violet-500 font-bold text-base"><Sparkles className="w-4 h-4 inline" /></span>
            <span className="font-semibold text-violet-900 text-sm">Tutor AI</span>
          </div>
          <Button variant="secondary" className="opacity-70 cursor-not-allowed mt-1 mb-1 text-xs px-2 py-1 h-7" disabled>
            Tutor AI
          </Button>
          <span className="text-[11px] text-violet-600">0 disponíveis</span>
        </section>
      </div>

      {/* CONTEÚDO PRINCIPAL: Scroll dedicado, letras maiores, conteúdo unificado */}
      <main className="flex-1 flex flex-col max-w-3xl mx-auto bg-white rounded-xl shadow-xl border px-4 py-5 relative min-h-[350px] max-h-[calc(100vh-64px)] overflow-y-auto">
        {/* Erro/carregando */}
        {loading && (
          <div className="text-center mt-10">
            <Loader />
            <div className="mt-2 text-base text-gray-600">Carregando caso...</div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-3 text-base">{error}</div>
        )}
        {!loading && caso && (
          <>
            {/* Título e categoria */}
            <div className="flex gap-2 items-center mb-3">
              <span className="inline-flex items-center bg-white text-cyan-900 rounded-full shadow px-5 py-2 text-2xl font-extrabold tracking-wide">
                🧠 {caso.title}
              </span>
              {caso.category_id && (
                <span className="bg-cyan-50 border border-cyan-200 rounded px-2 py-1 text-cyan-700 text-sm font-semibold ml-2 flex items-center gap-1">
                  <Book className="w-5 h-5" /> {caso.category_id}
                </span>
              )}
            </div>
            {/* HISTÓRIA CLÍNICA + DADOS PACIENTE UNIFICADOS */}
            <section className="bg-green-50 border-l-4 border-green-500 rounded-xl shadow px-6 py-3 mb-4 max-w-[95%]">
              <div className="text-green-900 font-bold mb-2 flex items-center gap-2 text-xl">
                <Lightbulb className="w-6 h-6 text-green-600" /> História Clínica
              </div>
              <div className="text-green-900 text-lg mb-2 leading-relaxed whitespace-pre-line">
                {/* Unifica história com achados/dados, prioriza novo campo se existir */}
                {caso.patient_clinical_info || caso.findings}
              </div>
              <div className="flex gap-2 flex-wrap text-[17px] mt-2 mb-0">
                <div className="bg-white border rounded px-3 py-1 text-cyan-900 underline cursor-pointer w-fit font-medium">
                  {/* Dados do paciente completos em linha */}
                  {caso.patient_gender ? (
                    <>
                      {caso.patient_gender}, {caso.patient_age} anos{caso.symptoms_duration && `, sintomas há ${caso.symptoms_duration}`}
                    </>
                  ) : (
                    "—"
                  )}
                </div>
                {caso.patient_additional_info && (
                  <div className="bg-blue-100 border border-blue-200 rounded px-3 py-1 text-blue-900 w-fit text-[15px]">
                    {caso.patient_additional_info}
                  </div>
                )}
              </div>
            </section>
            {/* Pergunta e Opções */}
            <section className="bg-white border border-cyan-200 rounded-lg shadow px-6 py-4 mb-5">
              <div className="font-bold text-cyan-900 text-2xl mb-2">Pergunta Principal</div>
              <div className="mb-3 text-[19px] font-semibold text-gray-900">{caso.main_question}</div>
              <div>
                <div className="flex flex-col gap-3 mb-5">
                  {(shuffled?.options || caso.answer_options || []).map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      className={clsx(
                        "w-full text-left px-6 py-4 rounded shadow border font-bold transition text-xl",
                        !answered
                          ? "hover:bg-cyan-50 border-cyan-200"
                          : idx === correctIdx
                            ? "bg-green-50 border-green-400 text-green-800 font-extrabold"
                            : idx === selected
                              ? "bg-red-50 border-red-400 text-red-600 font-extrabold"
                              : "opacity-75"
                      )}
                      disabled={answered}
                      tabIndex={0}
                      onClick={() => setSelected(idx)}
                      aria-label={`Selecionar alternativa ${getLetter(idx)}`}
                    >
                      <span className="font-bold mr-2">{getLetter(idx)})</span> {opt}
                    </button>
                  ))}
                </div>
                <Button
                  disabled={selected === null || answered}
                  onClick={() => setAnswered(true)}
                  className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold shadow text-lg py-3"
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
                  "mt-2 p-6 rounded-xl shadow border text-xl animate-scale-in",
                  acertou
                    ? "bg-green-50 border-green-600 text-green-900"
                    : "bg-yellow-50 border-yellow-600 text-yellow-900"
                )}
              >
                <div className="flex items-center gap-2 mb-2 text-2xl font-bold">
                  {feedbackMsg.title} {feedbackMsg.icon}
                </div>
                <div>
                  {acertou ? (
                    <span>
                      <b>✅ Resposta correta!</b>
                      <div className="mt-2 text-lg">{caso.explanation || "Explicação não disponível para este caso."}</div>
                    </span>
                  ) : (
                    <span>
                      <b>❌ Resposta incorreta.</b>
                      <div className="mt-2 text-lg">
                        {(shuffled?.feedbacks?.[selected!] ?? caso.answer_feedbacks?.[selected!]) ||
                          caso.explanation ||
                          "Explicação não disponível para esta alternativa."}
                      </div>
                    </span>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
// Fim das alterações
