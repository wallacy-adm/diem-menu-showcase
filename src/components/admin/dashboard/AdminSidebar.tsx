import { Tag, UtensilsCrossed, Percent, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";
import carpeDiemLogo from "@/assets/carpe-diem-logo.png";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: "categories" | "products" | "promotions" | "settings") => void;
}

const menuItems = [
  { id: "categories", icon: Tag, label: "Categorias" },
  { id: "products", icon: UtensilsCrossed, label: "Produtos" },
  { id: "promotions", icon: Percent, label: "Promoções" },
  { id: "settings", icon: Settings, label: "Configurações" },
] as const;

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { settings } = useSettings();
  
  const adminLogo = settings?.admin_logo_url || carpeDiemLogo;
  const brandName = settings?.brand_name || "Carpe Diem Motel";

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <img 
          src={adminLogo}
          alt={brandName}
          className="w-20 h-20 mx-auto rounded-lg object-contain"
        />
        <h2 className="text-sm font-semibold text-center mt-3 text-foreground">
          Painel Administrativo
        </h2>
        <p className="text-xs text-muted-foreground text-center mt-1">
          {brandName}
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                "hover:bg-secondary/50",
                isActive && "bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
