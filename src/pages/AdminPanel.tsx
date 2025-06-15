import React from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Routes, Route, Outlet } from "react-router-dom";
import CasosMedicos from "./admin/CasosMedicos";
import GestaoCasos from "./admin/GestaoCasos";

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
          <Routes>
            <Route path="casos-medicos" element={<CasosMedicos />} />
            <Route path="gestao-casos" element={<GestaoCasos />} />
            {/* Coloque aqui outras rotas para outros módulos do admin futuramente */}
          </Routes>
          {/* <Outlet /> */}
        </section>
      </main>
    </div>
  );
}
