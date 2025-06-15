
import React from "react";
import { Button } from "@/components/ui/button";

const EVENT_TEMPLATES = [
  {
    title: "Desafio Radiologia Básica",
    description: "Somente RXs, nível fácil/moderado.",
    filters: {
      modality: ["Radiografia (RX)"],
      difficulty: ["1", "2"]
    },
    numberOfCases: 8,
    durationMinutes: 16,
    prizeRadcoins: 400,
    autoStart: true,
  },
  {
    title: "Maratona Neurorradiologia",
    description: "TC/RM de crânio e coluna, casos difíceis.",
    filters: {
      modality: ["Tomografia Computadorizada (TC)", "Ressonância Magnética (RM)"],
      subtype: ["TC Crânio", "RM Crânio", "TC Coluna", "RM Coluna"],
      difficulty: ["3"]
    },
    numberOfCases: 12,
    durationMinutes: 24,
    prizeRadcoins: 900,
    autoStart: false,
  },
  {
    title: "Speed Quiz Emergência",
    description: "Casos rápidos de múltiplas modalidades.",
    filters: {
      modality: ["Radiografia (RX)", "Tomografia Computadorizada (TC)"],
      difficulty: ["1", "2", "3"]
    },
    numberOfCases: 10,
    durationMinutes: 10,
    prizeRadcoins: 800,
    autoStart: true,
  },
];

export function EventTemplatesModal({ onApplyTemplate, onClose }: {
  onApplyTemplate: (template: any) => void,
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded shadow-xl p-6 w-full max-w-md relative">
        <h3 className="text-lg font-bold mb-4">Templates Rápidos de Evento</h3>
        <ul className="space-y-3 mb-3">
          {EVENT_TEMPLATES.map((tpl, idx) => (
            <li key={idx} className="border rounded p-3 hover:shadow cursor-pointer group transition"
              onClick={() => onApplyTemplate(tpl)}>
              <div className="flex items-center gap-2">
                <span className="font-semibold group-hover:text-blue-700">{tpl.title}</span>
              </div>
              <div className="text-sm text-gray-600">{tpl.description}</div>
            </li>
          ))}
        </ul>
        <Button type="button" size="sm" variant="secondary" className="w-full" onClick={onClose}>Fechar</Button>
      </div>
    </div>
  );
}
