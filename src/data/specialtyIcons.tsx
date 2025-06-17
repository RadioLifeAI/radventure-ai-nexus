import React from "react";
import {
  Activity, Baby, Brain, HeartPulse, Users, TestTube, Syringe, Droplets,
  Shield, Headphones, FileText, SquarePlus, SquareMinus, Circle, Stethoscope,
  Eye, Bone, Zap, Heart, Wind, Pill, Camera, Microscope, Scissors,
  Thermometer, Clock, Bandage, Target, Waves, FlaskConical, Dna,
  Sparkles, Star, Crown
} from "lucide-react";

export const specialtyIconMapping: Record<string, {
  icon: React.ReactElement;
  gradient: string;
  borderColor: string;
  description: string;
}> = {
  // Diagnóstico por Imagem
  "Neurorradiologia": {
    icon: <Brain size={32} className="text-purple-600" />,
    gradient: "bg-gradient-to-br from-purple-50 to-purple-100",
    borderColor: "border-purple-200",
    description: "Neuroimagem e diagnósticos cerebrais"
  },
  "Radiologia Torácica": {
    icon: <HeartPulse size={32} className="text-red-500" />,
    gradient: "bg-gradient-to-br from-red-50 to-red-100",
    borderColor: "border-red-200",
    description: "Diagnóstico por imagem do tórax"
  },
  "Radiologia Abdominal": {
    icon: <FileText size={32} className="text-orange-500" />,
    gradient: "bg-gradient-to-br from-orange-50 to-orange-100",
    borderColor: "border-orange-200",
    description: "Diagnóstico por imagem abdominal"
  },
  "Radiologia Musculoesquelética": {
    icon: <Bone size={32} className="text-gray-600" />,
    gradient: "bg-gradient-to-br from-gray-50 to-gray-100",
    borderColor: "border-gray-200",
    description: "Diagnóstico de ossos e articulações"
  },
  "Radiologia da Coluna": {
    icon: <SquareMinus size={32} className="text-slate-600" />,
    gradient: "bg-gradient-to-br from-slate-50 to-slate-100",
    borderColor: "border-slate-200",
    description: "Diagnóstico da coluna vertebral"
  },
  "Radiologia Cardiovascular": {
    icon: <Heart size={32} className="text-pink-500" />,
    gradient: "bg-gradient-to-br from-pink-50 to-pink-100",
    borderColor: "border-pink-200",
    description: "Diagnóstico cardiovascular"
  },
  "Radiologia Intervencionista": {
    icon: <Syringe size={32} className="text-indigo-600" />,
    gradient: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    borderColor: "border-indigo-200",
    description: "Procedimentos guiados por imagem"
  },
  "Radiologia de Cabeça e Pescoço": {
    icon: <Eye size={32} className="text-cyan-600" />,
    gradient: "bg-gradient-to-br from-cyan-50 to-cyan-100",
    borderColor: "border-cyan-200",
    description: "Diagnóstico de cabeça e pescoço"
  },

  // Especialidades Médicas
  "Medicina de Emergência": {
    icon: <Activity size={32} className="text-red-600" />,
    gradient: "bg-gradient-to-br from-red-50 to-red-100",
    borderColor: "border-red-200",
    description: "Atendimento de urgência e emergência"
  },
  "Pediatria": {
    icon: <Baby size={32} className="text-blue-500" />,
    gradient: "bg-gradient-to-br from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    description: "Medicina infantil e adolescente"
  },
  "Trauma": {
    icon: <Bandage size={32} className="text-yellow-600" />,
    gradient: "bg-gradient-to-br from-yellow-50 to-yellow-100",
    borderColor: "border-yellow-200",
    description: "Medicina traumatológica"
  },
  "Ginecologia": {
    icon: <Users size={32} className="text-pink-600" />,
    gradient: "bg-gradient-to-br from-pink-50 to-pink-100",
    borderColor: "border-pink-200",
    description: "Saúde feminina"
  },
  "Obstetrícia": {
    icon: <Baby size={32} className="text-green-500" />,
    gradient: "bg-gradient-to-br from-green-50 to-green-100",
    borderColor: "border-green-200",
    description: "Medicina materna e fetal"
  },
  "Hematologia": {
    icon: <Droplets size={32} className="text-red-700" />,
    gradient: "bg-gradient-to-br from-red-50 to-red-100",
    borderColor: "border-red-200",
    description: "Doenças do sangue"
  },
  "Gastrointestinal": {
    icon: <TestTube size={32} className="text-green-600" />,
    gradient: "bg-gradient-to-br from-green-50 to-green-100",
    borderColor: "border-green-200",
    description: "Sistema digestivo"
  },
  "Hepatobiliar": {
    icon: <FlaskConical size={32} className="text-amber-600" />,
    gradient: "bg-gradient-to-br from-amber-50 to-amber-100",
    borderColor: "border-amber-200",
    description: "Fígado e vias biliares"
  },
  "Dermatologia": {
    icon: <Shield size={32} className="text-orange-600" />,
    gradient: "bg-gradient-to-br from-orange-50 to-orange-100",
    borderColor: "border-orange-200",
    description: "Doenças da pele"
  },
  "Otorrinolaringologia": {
    icon: <Headphones size={32} className="text-teal-600" />,
    gradient: "bg-gradient-to-br from-teal-50 to-teal-100",
    borderColor: "border-teal-200",
    description: "Ouvido, nariz e garganta"
  },
  "Oncologia": {
    icon: <Target size={32} className="text-purple-700" />,
    gradient: "bg-gradient-to-br from-purple-50 to-purple-100",
    borderColor: "border-purple-200",
    description: "Tratamento do câncer"
  },
  "Urologia": {
    icon: <Droplets size={32} className="text-blue-600" />,
    gradient: "bg-gradient-to-br from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    description: "Sistema urinário"
  },
  "Vascular": {
    icon: <Waves size={32} className="text-indigo-500" />,
    gradient: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    borderColor: "border-indigo-200",
    description: "Sistema vascular"
  },
  "Cirurgia": {
    icon: <Scissors size={32} className="text-gray-700" />,
    gradient: "bg-gradient-to-br from-gray-50 to-gray-100",
    borderColor: "border-gray-200",
    description: "Procedimentos cirúrgicos"
  },
  "Clínica Médica": {
    icon: <Stethoscope size={32} className="text-blue-700" />,
    gradient: "bg-gradient-to-br from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    description: "Medicina clínica geral"
  },
  "Reumatologia": {
    icon: <Bone size={32} className="text-green-700" />,
    gradient: "bg-gradient-to-br from-green-50 to-green-100",
    borderColor: "border-green-200",
    description: "Doenças reumáticas"
  },
  "Nefrologia": {
    icon: <Droplets size={32} className="text-cyan-700" />,
    gradient: "bg-gradient-to-br from-cyan-50 to-cyan-100",
    borderColor: "border-cyan-200",
    description: "Doenças renais"
  },
  "Cardiologia": {
    icon: <HeartPulse size={32} className="text-red-600" />,
    gradient: "bg-gradient-to-br from-red-50 to-red-100",
    borderColor: "border-red-200",
    description: "Doenças do coração"
  },
  "Neurologia": {
    icon: <Brain size={32} className="text-purple-600" />,
    gradient: "bg-gradient-to-br from-purple-50 to-purple-100",
    borderColor: "border-purple-200",
    description: "Doenças neurológicas"
  },
  "Endocrinologia": {
    icon: <Pill size={32} className="text-yellow-600" />,
    gradient: "bg-gradient-to-br from-yellow-50 to-yellow-100",
    borderColor: "border-yellow-200",
    description: "Sistema endócrino"
  },
  "Infectologia": {
    icon: <Shield size={32} className="text-green-600" />,
    gradient: "bg-gradient-to-br from-green-50 to-green-100",
    borderColor: "border-green-200",
    description: "Doenças infecciosas"
  },
  "Psiquiatria": {
    icon: <Brain size={32} className="text-indigo-600" />,
    gradient: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    borderColor: "border-indigo-200",
    description: "Saúde mental"
  },
  "Pneumologia": {
    icon: <Wind size={32} className="text-sky-600" />,
    gradient: "bg-gradient-to-br from-sky-50 to-sky-100",
    borderColor: "border-sky-200",
    description: "Doenças pulmonares"
  },
  "Oftalmologia": {
    icon: <Eye size={32} className="text-emerald-600" />,
    gradient: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    borderColor: "border-emerald-200",
    description: "Doenças oculares"
  },
  "Anestesiologia": {
    icon: <Thermometer size={32} className="text-violet-600" />,
    gradient: "bg-gradient-to-br from-violet-50 to-violet-100",
    borderColor: "border-violet-200",
    description: "Anestesia e dor"
  },
  "Medicina do Trabalho": {
    icon: <Clock size={32} className="text-stone-600" />,
    gradient: "bg-gradient-to-br from-stone-50 to-stone-100",
    borderColor: "border-stone-200",
    description: "Saúde ocupacional"
  },
  "Medicina Nuclear": {
    icon: <Zap size={32} className="text-lime-600" />,
    gradient: "bg-gradient-to-br from-lime-50 to-lime-100",
    borderColor: "border-lime-200",
    description: "Diagnóstico nuclear"
  },
  "Patologia": {
    icon: <Microscope size={32} className="text-rose-600" />,
    gradient: "bg-gradient-to-br from-rose-50 to-rose-100",
    borderColor: "border-rose-200",
    description: "Diagnóstico patológico"
  },
  "Genética Médica": {
    icon: <Dna size={32} className="text-fuchsia-600" />,
    gradient: "bg-gradient-to-br from-fuchsia-50 to-fuchsia-100",
    borderColor: "border-fuchsia-200",
    description: "Medicina genética"
  },
  "Medicina Esportiva": {
    icon: <Target size={32} className="text-emerald-500" />,
    gradient: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    borderColor: "border-emerald-200",
    description: "Medicina esportiva"
  },
  "Geriatria": {
    icon: <Clock size={32} className="text-amber-700" />,
    gradient: "bg-gradient-to-br from-amber-50 to-amber-100",
    borderColor: "border-amber-200",
    description: "Medicina do idoso"
  },
  "Medicina Intensiva": {
    icon: <Activity size={32} className="text-red-700" />,
    gradient: "bg-gradient-to-br from-red-50 to-red-100",
    borderColor: "border-red-200",
    description: "Cuidados intensivos"
  },
  "Outros": {
    icon: <Circle size={32} className="text-gray-500" />,
    gradient: "bg-gradient-to-br from-gray-50 to-gray-100",
    borderColor: "border-gray-200",
    description: "Outras especialidades"
  }
};

// Função para obter dados da especialidade
export function getSpecialtyData(specialtyName: string) {
  return specialtyIconMapping[specialtyName] || specialtyIconMapping["Outros"];
}
