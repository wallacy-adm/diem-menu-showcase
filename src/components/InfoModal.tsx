import { MapPin, Instagram, MessageCircle } from "lucide-react";
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
  const handleInstagramClick = () => {
    window.open(settings?.instagram_url || "https://instagram.com", "_blank");
  };

  const handleWhatsAppClick = () => {
    window.open(settings?.whatsapp_url || "https://wa.me/", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">
            {settings?.brand_name || "Carpe Diem Motel"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Entre em contato conosco
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                Endereço
              </h3>
              <p className="text-sm text-muted-foreground">
                {settings?.address || "BR-104, Km 118, Lagoa Seca – PB"}
              </p>
            </div>
          </div>

          <Button
            onClick={handleInstagramClick}
            className="w-full justify-start gap-3 h-auto p-4 bg-secondary hover:bg-secondary/80 text-foreground border border-border"
            variant="outline"
          >
            <Instagram className="h-5 w-5 text-primary" />
            <div className="text-left">
              <h3 className="font-semibold text-sm">Instagram</h3>
              <p className="text-xs text-muted-foreground">Siga-nos no Instagram</p>
            </div>
          </Button>

          <Button
            onClick={handleWhatsAppClick}
            className="w-full justify-start gap-3 h-auto p-4 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <MessageCircle className="h-5 w-5" />
            <div className="text-left">
              <h3 className="font-semibold text-sm">WhatsApp</h3>
              <p className="text-xs opacity-90">Fale conosco pelo WhatsApp</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
