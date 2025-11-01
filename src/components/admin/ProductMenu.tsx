import { Eye, EyeOff, ArrowDown, Copy, Trash2 } from "lucide-react";

interface ProductMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function ProductMenu({ visible, onClose }: ProductMenuProps) {
  const menuItems = [
    { 
      icon: visible ? EyeOff : Eye, 
      label: visible ? "Invisível" : "Visível", 
      color: "text-foreground" 
    },
    { icon: ArrowDown, label: "Mover para baixo", color: "text-foreground" },
    { icon: Copy, label: "Duplicar", color: "text-foreground" },
    { icon: Trash2, label: "Excluir", color: "text-destructive" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-lg shadow-lg z-50 py-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors ${item.color}`}
            onClick={() => {
              // Handle action
              onClose();
            }}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
