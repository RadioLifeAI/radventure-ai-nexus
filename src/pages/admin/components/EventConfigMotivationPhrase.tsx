
import React from "react";

const PHRASES = [
  "🚀 Pronto para criar um evento épico de radiologia?",
  "🎯 Bons filtros = mais aprendizado e diversão!",
  "🏆 Capriche na premiação e motive os participantes!",
  "💡 Dica: eventos balanceados engajam melhor.",
  "🔥 Gamifique: desafie, recompense, repita!"
];

export function EventConfigMotivationPhrase() {
  const [phrase] = React.useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  return (
    <div className="text-xs text-indigo-600 mb-1 animate-fade-in">{phrase}</div>
  );
}
