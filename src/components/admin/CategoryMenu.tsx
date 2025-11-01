import { Eye, EyeOff, ArrowUp, ArrowDown, Copy, Trash2 } from "lucide-react";

interface CategoryMenuProps {
  onClose: () => void;
}

export function CategoryMenu({ onClose }: CategoryMenuProps) {
  const menuItems = [
    { icon: Eye, label: "Alterar produtos para visíveis", color: "text-foreground" },
    { icon: EyeOff, label: "Alterar produtos para invisíveis", color: "text-foreground" },
    { icon: ArrowUp, label: "Subir", color: "text-foreground" },
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
      <div className="absolute right-0 top-full mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 py-1">
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
