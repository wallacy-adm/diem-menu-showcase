import { Menu, ShoppingCart, TrendingUp, MoreHorizontal } from "lucide-react";

interface AdminBottomNavProps {
  activeTab: "cardapio" | "pedidos" | "vendas" | "mais";
}

export function AdminBottomNav({ activeTab }: AdminBottomNavProps) {
  const tabs = [
    { id: "cardapio", icon: Menu, label: "Cardápio" },
    { id: "pedidos", icon: ShoppingCart, label: "Pedidos PDV" },
    { id: "vendas", icon: TrendingUp, label: "Vendas" },
    { id: "mais", icon: MoreHorizontal, label: "Mais" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              className={`flex flex-col items-center justify-center gap-1 min-w-[60px] transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
