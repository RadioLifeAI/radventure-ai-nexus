
import { useRef } from "react";

/**
 * Salva o valor anterior do campo e permite desfazer (restaurar).
 * Retorna: [handleBeforeChange, prevValue, undo, canUndo]
 */
export function useFieldUndo<T>(initialValue: T) {
  const prevValueRef = useRef<T>(initialValue);
  const canUndoRef = useRef(false);

  // Chame antes de aplicar IA para "trackear" o valor anterior
  function handleBeforeChange(currentValue: T) {
    prevValueRef.current = currentValue;
    canUndoRef.current = true;
  }

  // Restaura o valor anterior e limpa o flag
  function undo(setValue: (val: T) => void) {
    setValue(prevValueRef.current);
    canUndoRef.current = false;
  }

  // Para uso do botão: precisa forçar re-render se quiser reatividade total
  function canUndo() {
    return canUndoRef.current;
  }

  return { handleBeforeChange, undo, canUndo };
}
