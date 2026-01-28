import { MapPin, MessageCircle, Instagram } from "lucide-react";
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
          {/* Address - Clickable Google Maps link */}
          <a
            href="https://maps.app.goo.gl/5TZTQ7G4614ZHQmM8"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-5 rounded-xl bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors cursor-pointer"
          >
            <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-foreground mb-1.5">
                Endereço
              </h3>
              <span className="text-sm text-primary underline">
                {settings?.address || "BR-104, Km 118, Lagoa Seca – PB"}
              </span>
            </div>
          </a>

          {/* Instagram - Clickable link */}
          <a
            href={settings?.instagram_url || "https://instagram.com/carpediemmotel"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-5 rounded-xl bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors cursor-pointer"
          >
            <Instagram className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-foreground mb-1.5">
                Instagram
              </h3>
              <span className="text-sm text-primary underline">
                Siga-nos no Instagram
              </span>
            </div>
          </a>

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
