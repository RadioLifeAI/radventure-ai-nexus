
import React from "react";
import { Input } from "@/components/ui/input";

type Props = {
  answers: string[];
  correctIndex: number;
  handleAnswerChange: (idx: number, value: string) => void;
  handleCorrectIndexChange: (idx: number) => void;
};

export function QuizAnswersFields({ answers, correctIndex, handleAnswerChange, handleCorrectIndexChange }: Props) {
  return (
    <div className="mb-4 mt-2">
      <label className="block font-semibold mb-1">Alternativas (marque a correta):</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {answers.map((answer, idx) => (
          <div key={idx} className="flex items-center space-x-3">
            <input
              type="radio"
              checked={correctIndex === idx}
              onChange={() => handleCorrectIndexChange(idx)}
              className="accent-cyan-600"
              name="quiz-correct"
              required
              tabIndex={0}
              aria-label={`Selecionar como correta a alternativa ${idx+1}`}
            />
            <Input
              value={answer}
              onChange={e => handleAnswerChange(idx, e.target.value)}
              placeholder={`Alternativa ${idx+1}`}
              className="flex-1"
              required
              maxLength={160}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
