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
      <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground">
            {settings?.brand_name || "Carpe Diem Motel"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base mt-2">
            Entre em contato conosco
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4 p-5 rounded-xl bg-secondary/50 border border-border">
            <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-foreground mb-1.5">
                Endereço
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {settings?.address || "BR-104, Km 118, Lagoa Seca – PB"}
              </p>
            </div>
          </div>

          <Button
            onClick={handleInstagramClick}
            className="w-full justify-start gap-4 h-auto p-5 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-xl"
            variant="outline"
          >
            <Instagram className="h-6 w-6 text-primary" />
            <div className="text-left">
              <h3 className="font-bold text-base">Instagram</h3>
              <p className="text-sm text-muted-foreground">Siga-nos no Instagram</p>
            </div>
          </Button>

          <Button
            onClick={handleWhatsAppClick}
            className="w-full justify-start gap-4 h-auto p-5 bg-primary hover:bg-primary/90 text-black rounded-xl font-semibold"
          >
            <MessageCircle className="h-6 w-6" />
            <div className="text-left">
              <h3 className="font-bold text-base">WhatsApp</h3>
              <p className="text-sm opacity-80">Fale conosco pelo WhatsApp</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
