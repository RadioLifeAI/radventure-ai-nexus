
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CasesCentralAdvanced } from "@/components/cases/CasesCentralAdvanced";

export default function Casos() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      // Quando há um ID, o modal avançado será aberto automaticamente
      // O CasesCentralAdvanced já tem a lógica para detectar casos específicos
      console.log('Abrindo caso específico:', id);
    }
  }, [id]);

  return <CasesCentralAdvanced />;
}
