import { MapPin, Clock, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
}

export const InfoModal = ({ isOpen, onClose, settings }: InfoModalProps) => {
  // Centralized WhatsApp URL - uses settings or fallback
  const whatsappUrl = settings?.whatsapp_url || "https://wa.me/5583999999999";

  const handleComplaintsClick = () => {
    const message = encodeURIComponent("Olá, gostaria de registrar uma reclamação ou sugestão.");
    window.open(`${whatsappUrl}?text=${message}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground">
            {settings?.brand_name || "Carpe Diem Motel"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base mt-2">
            Informações do estabelecimento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Address - Non-interactive text */}
          <div 
            className="flex items-start gap-4 p-5 rounded-xl bg-secondary/50 border border-border select-text cursor-default"
            style={{ pointerEvents: 'none', touchAction: 'none', userSelect: 'text' }}
          >
            <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-0.5 pointer-events-none" />
            <div className="pointer-events-none">
              <h3 className="font-bold text-base text-foreground mb-1.5 pointer-events-none">
                Endereço
              </h3>
              <span className="text-sm text-muted-foreground leading-relaxed block pointer-events-none">
                {settings?.address || "BR-104, Km 118, Lagoa Seca – PB"}
              </span>
            </div>
          </div>

          {/* Operating Hours - Non-interactive */}
          <div 
            className="flex items-start gap-4 p-5 rounded-xl bg-secondary/50 border border-border select-text cursor-default"
            style={{ pointerEvents: 'none', touchAction: 'none', userSelect: 'text' }}
          >
            <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-0.5 pointer-events-none" />
            <div className="pointer-events-none">
              <h3 className="font-bold text-base text-foreground mb-1.5 pointer-events-none">
                Funcionamento
              </h3>
              <span className="text-sm text-muted-foreground leading-relaxed block pointer-events-none">
                24 horas, todos os dias
              </span>
            </div>
          </div>

          {/* Complaints/Suggestions - Clickable WhatsApp link */}
          <Button
            onClick={handleComplaintsClick}
            className="w-full justify-start gap-4 h-auto p-5 bg-primary hover:bg-primary/90 text-black rounded-xl font-semibold"
          >
            <MessageCircle className="h-6 w-6" />
            <div className="text-left">
              <h3 className="font-bold text-base">Reclamações ou Sugestões</h3>
              <p className="text-sm opacity-80">Fale conosco pelo WhatsApp</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
