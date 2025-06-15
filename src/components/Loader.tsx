
import React from "react";

/**
 * Loader animado para feedback visual de carregamento.
 */
export function Loader() {
  return (
    <svg className="animate-spin h-8 w-8 text-cyan-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
  );
}
