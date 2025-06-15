import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles, Sword, Smile, Frown, Lightbulb, Book, Image } from "lucide-react";
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

type CasoUsuarioViewProps = {
  idProp?: string;
  isAdminView?: boolean;
};

export default function CasoUsuarioView(props: CasoUsuarioViewProps) {
  // Usa id da URL se não vier por prop (modo usuário). Admin passa id por prop.
  const urlParams = useParams();
  const id = props.idProp || urlParams.id;
  const [caso, setCaso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca o caso pelo ID vindo da rota
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

  // Alternativas embaralhadas apenas na visualização do usuário
  const shuffled = useShuffledAnswers(caso);

  // Índice correto de acordo com o shuffle local
  const correctIdx = shuffled?.correctIndex ?? caso?.correct_answer_index;
  const acertou = selected === correctIdx && answered && selected !== null;
  const feedbackMsg = randomFeedback(acertou);
  const showFeedback = answered && selected !== null;

  // Detecta array de imagens (formato novo)
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

  return (
    <div className="flex flex-col md:flex-row gap-6 px-4 py-6 md:py-10 bg-[#f5f7fd] min-h-screen animate-fade-in">
      {/* Esquerda: Imagem - agora carrossel de imagens */}
      <div className="md:w-[350px] flex-shrink-0 flex flex-col items-center">
        <div className="rounded-xl bg-black overflow-hidden shadow-md border mb-2 flex items-center justify-center" style={{ minHeight: 200 }}>
          {loading ? (
            <Loader />
          ) : caseImages.length > 0 ? (
            <Carousel className="w-[310px]">
              <CarouselContent>
                {caseImages.map((img, idx) => (
                  <CarouselItem key={idx}>
                    <img
                      src={img.url}
                      alt={`Imagem do caso ${idx + 1}`}
                      className="object-contain max-h-[320px] min-w-[280px] rounded"
                    />
                    {/* Legenda só aparece após 'Responder' */}
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
            <div className="flex flex-col items-center justify-center w-[280px] h-[200px] gap-2">
              <Book className="w-12 h-12 text-gray-400 opacity-60" />
              <span className="text-xs text-gray-500">Sem imagem</span>
            </div>
          )}
        </div>
        {!loading && (
          <div className="flex gap-2 mt-2 mb-6">
            <Button size="sm" variant="outline" title="Zoom In"><ArrowDown style={{ rotate: "180deg" }} /></Button>
            <Button size="sm" variant="outline" title="Zoom Out"><ArrowDown /></Button>
            <Button size="sm" variant="outline" title="Fullscreen">⛶</Button>
          </div>
        )}
      </div>

      {/* Meio */}
      <div className="flex-1 max-w-2xl">
        {/* Erro/carregando */}
        {loading && (
          <div className="text-center mt-10">
            <Loader />
            <div className="mt-2 text-sm text-gray-600">Carregando caso...</div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-3 text-sm">{error}</div>
        )}
        {!loading && caso && (
          <>
            {/* Título e categoria */}
            <div className="flex gap-2 items-center mb-2">
              <span className="inline-flex items-center bg-white text-cyan-900 rounded-full shadow px-4 py-1 text-lg font-bold">
                🧠 {caso.title}
              </span>
              {caso.category_id && (
                <span className="bg-cyan-50 border border-cyan-200 rounded px-2 py-1 text-cyan-700 text-xs font-semibold ml-2 flex items-center gap-1">
                  <Book className="w-4 h-4" /> {caso.category_id}
                </span>
              )}
            </div>

            {/* História clínica */}
            <section className="bg-green-50 border-l-4 border-green-500 rounded-xl shadow px-6 py-4 mb-3">
              <div className="text-green-900 font-semibold mb-1 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-green-500" /> História Clínica
              </div>
              <div className="text-green-900 text-sm mb-2">{caso.patient_clinical_info || caso.findings}</div>
              <div className="bg-white border rounded px-3 py-1.5 text-xs text-blue-900 underline cursor-pointer w-fit">Dados do Paciente<br />
                <span className="text-[13px]">
                  {caso.patient_gender ? (
                    <>
                      {caso.patient_gender}, {caso.patient_age} anos{caso.symptoms_duration && `, sintomas há ${caso.symptoms_duration}`}
                    </>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            </section>
            {/* Pergunta e Opções */}
            <section className="bg-white rounded-lg shadow px-5 py-4 mb-4">
              <div className="font-bold text-cyan-900 text-base mb-2">Pergunta Principal</div>
              <div className="mb-2 text-[16px] font-medium">{caso.main_question}</div>
              <div>
                <div className="flex flex-col gap-3 mb-4">
                  {(shuffled?.options || caso.answer_options || []).map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      className={clsx(
                        "w-full text-left px-4 py-3 rounded shadow border font-medium transition",
                        !answered
                          ? "hover:bg-cyan-50 border-cyan-200"
                          : idx === correctIdx
                            ? "bg-green-50 border-green-400 text-green-800 font-bold"
                            : idx === selected
                              ? "bg-red-50 border-red-400 text-red-600 font-bold"
                              : "opacity-70"
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
                      <div className="mt-1 text-sm">{caso.explanation || "Explicação não disponível para este caso."}</div>
                    </span>
                  ) : (
                    <span>
                      <b>❌ Resposta incorreta.</b>
                      <div className="mt-1 text-sm">
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
              <span className="text-[12px] text-gray-500">{caso?.max_elimination ?? 0}</span>
            </Button>
            <Button variant="outline" className="flex-1 flex flex-col items-center py-3 gap-1 cursor-not-allowed opacity-60" disabled>
              <span className="text-blue-600"><ArrowDown className="w-5 h-5 inline" /></span>
              <span className="text-xs font-bold">Pular Questão</span>
              <span className="text-[12px] text-gray-500">{caso?.can_skip ? 1 : 0}</span>
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
