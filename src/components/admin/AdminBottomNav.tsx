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
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white z-20"
      style={{ 
        borderTop: '1px solid #E5E5EA',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              className="flex flex-col items-center justify-center gap-1 flex-1 transition-colors"
              style={{ color: isActive ? '#007AFF' : '#8A8A8E' }}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
