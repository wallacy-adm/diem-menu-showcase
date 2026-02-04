import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "@/components/admin/dashboard/AdminSidebar";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { CategoriesSection } from "@/components/admin/dashboard/CategoriesSection";
import { ProductsSection } from "@/components/admin/dashboard/ProductsSection";
import { PromotionsSection } from "@/components/admin/dashboard/PromotionsSection";
import { SettingsSection } from "@/components/admin/dashboard/SettingsSection";

type ActiveSection = "categories" | "products" | "promotions" | "settings";

/**
 * AdminDashboard - Admin Panel
 * 
 * Architecture:
 * - Static shell (sidebar, header, footer) - ALWAYS mounted immediately
 * - Dynamic content sections - load asynchronously without blocking first paint
 * 
 * This ensures first paint happens immediately with the layout visible.
 */
export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("products");
  const navigate = useNavigate();
  const { session, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        navigate('/admin/login');
      } else if (isAdmin === false) {
        // Authenticated but not admin
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  }, [session, isAdmin, isLoading, navigate, toast]);

  const handleLogout = () => {
    // Logout removed - dashboard is now public
  };

  // Render layout immediately, show loading state inside the layout
  const showAuthLoading = isLoading;
  const showAccessDenied = !isLoading && (!session || !isAdmin);

  // If access denied, return null (redirect will happen via useEffect)
  if (showAccessDenied) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex w-full max-w-full overflow-x-hidden">
      {/* Sidebar - renders immediately (static shell) */}
      <AdminSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header - renders immediately (static shell) */}
        <DashboardHeader onLogout={handleLogout} />

        {/* Content Area - dynamic content loads here */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-full sm:max-w-7xl mx-auto w-full">
            {showAuthLoading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : (
              <>
                {activeSection === "categories" && <CategoriesSection />}
                {activeSection === "products" && <ProductsSection />}
                {activeSection === "promotions" && <PromotionsSection />}
                {activeSection === "settings" && <SettingsSection />}
              </>
            )}
          </div>
        </main>

        {/* Footer - renders immediately (static shell) */}
        <footer className="border-t border-border p-4 text-center flex-shrink-0">
          <p className="text-xs text-muted-foreground">
            Painel administrativo do cardápio Carpe Diem Motel — Uso interno exclusivo.
          </p>
        </footer>
      </div>
    </div>
  );
}
