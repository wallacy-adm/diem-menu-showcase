import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onLogout: () => void;
}

export function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Painel Administrativo — Cardápio Carpe Diem Motel
        </h1>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onLogout}
        className="gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sair
      </Button>
    </header>
  );
}
