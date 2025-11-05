import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "@/components/admin/dashboard/AdminSidebar";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { CategoriesSection } from "@/components/admin/dashboard/CategoriesSection";
import { ProductsSection } from "@/components/admin/dashboard/ProductsSection";
import { PromotionsSection } from "@/components/admin/dashboard/PromotionsSection";
import { SettingsSection } from "@/components/admin/dashboard/SettingsSection";

type ActiveSection = "categories" | "products" | "promotions" | "settings";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("products");
  const { session, isAdmin, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader onLogout={handleLogout} />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {activeSection === "categories" && <CategoriesSection />}
            {activeSection === "products" && <ProductsSection />}
            {activeSection === "promotions" && <PromotionsSection />}
            {activeSection === "settings" && <SettingsSection />}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Painel administrativo do cardápio Carpe Diem Motel — Uso interno exclusivo.
          </p>
        </footer>
      </div>
    </div>
  );
}
