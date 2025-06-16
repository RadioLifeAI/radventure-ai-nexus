
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { AdminHeader } from "@/components/navigation/AdminHeader";
import { AdminSidebar } from "@/components/AdminSidebar";
import { UserManagement } from "@/components/admin/UserManagement";
import { DashboardAnalytics } from "@/components/admin/DashboardAnalytics";
import CasosMedicos from "./admin/CasosMedicos";
import GestaoCasos from "./admin/GestaoCasos";
import CreateEvent from "./admin/CreateEvent";
import EventsManagement from "./admin/EventsManagement";
import { LoadingPage } from "@/components/navigation/LoadingPage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function AdminDashboard() {
  return (
    <div>
      <AdminHeader 
        title="Dashboard Administrativo"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Dashboard" }
        ]}
      />
      <div className="p-8">
        <DashboardAnalytics />
      </div>
    </div>
  );
}

function AdminUserManagement() {
  return (
    <div>
      <AdminHeader 
        title="Gestão de Usuários"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Usuários" }
        ]}
      />
      <div className="p-8">
        <UserManagement />
      </div>
    </div>
  );
}

function AdminCaseManagement() {
  return (
    <div>
      <AdminHeader 
        title="Casos Médicos"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Casos Médicos" }
        ]}
      />
      <div className="p-8">
        <CasosMedicos />
      </div>
    </div>
  );
}

function AdminCaseSettings() {
  return (
    <div>
      <AdminHeader 
        title="Gestão de Casos"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Gestão de Casos" }
        ]}
      />
      <div className="p-8">
        <GestaoCasos />
      </div>
    </div>
  );
}

function AdminCreateEvent() {
  return (
    <div>
      <AdminHeader 
        title="Criar Evento"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Eventos", href: "/admin/events" },
          { label: "Criar Evento" }
        ]}
      />
      <div className="p-8">
        <CreateEvent />
      </div>
    </div>
  );
}

function AdminEventsManagement() {
  return (
    <div>
      <AdminHeader 
        title="Gestão de Eventos"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Eventos" }
        ]}
      />
      <div className="p-8">
        <EventsManagement />
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { isAdmin, loading, userRoles } = useAdminPermissions();

  console.log('AdminPanel - Loading:', loading, 'IsAdmin:', isAdmin, 'Roles:', userRoles);

  if (loading) {
    return <LoadingPage />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <Shield className="text-red-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissões administrativas para acessar este painel.
          </p>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Se você deveria ter acesso administrativo, entre em contato com o suporte ou verifique suas permissões.
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.href = '/dashboard'}>
            <Shield size={16} className="mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-[235px] min-h-screen">
        <Routes>
          {/* Dashboard principal */}
          <Route path="/" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/analytics" element={<AdminDashboard />} />
          
          {/* Gestão de usuários */}
          <Route path="/usuarios" element={<AdminUserManagement />} />
          
          {/* Casos médicos */}
          <Route path="/casos-medicos" element={<AdminCaseManagement />} />
          <Route path="/gestao-casos" element={<AdminCaseSettings />} />
          
          {/* Eventos */}
          <Route path="/create-event" element={<AdminCreateEvent />} />
          <Route path="/events" element={<AdminEventsManagement />} />
          
          {/* Outras rotas podem ser adicionadas aqui */}
          <Route path="/*" element={
            <div className="p-8">
              <AdminHeader 
                title="Seção em Desenvolvimento"
                breadcrumbs={[
                  { label: "Admin", href: "/admin" }
                ]}
              />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Esta seção está em desenvolvimento. Use o menu lateral para navegar.
                </AlertDescription>
              </Alert>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}
