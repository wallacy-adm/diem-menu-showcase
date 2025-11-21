import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/admin/login');
    }
  }, [session, isLoading, navigate]);

  const handleLogout = () => {
    // Logout removed - dashboard is now public
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

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
