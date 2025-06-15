import React from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Outlet } from "react-router-dom";
import CasosMedicos from "./admin/CasosMedicos";

export default function AdminPanel() {
  // Aqui poderá ser checado o usuário logado/admin futuramente
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-[235px] min-h-screen">
        {/* Header fixo */}
        <header className="w-full flex items-center justify-between px-8 py-6 border-b bg-white shadow-sm min-h-[66px]">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">Painel de Administração</h1>
          <a href="/dashboard" className="bg-white border px-4 py-2 rounded-lg font-semibold text-gray-700 hover:bg-cyan-100 transition">← Voltar ao Dashboard</a>
        </header>
        <section className="p-8">
          {/* Conteúdo dinâmico das seções do admin */}
          <Outlet />
          {/* Aqui será renderizado o conteúdo de cada seção */}
          {/* Rotas filhas - renderiza os componentes das abas */}
          {/* Renderiza rota de casos médicos */}
          {/* Adicional: rotas reais podem ser feitas no router principal, aqui só demonstrando uso! */}
          {/* <Route path="casos-medicos" element={<CasosMedicos />} /> */}
        </section>
      </main>
    </div>
  );
}
