import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";
import type { HighlightLevel } from "@/hooks/useActivePromotions";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    oldPrice?: number;
    image: string;
    category: string;
    promotionName?: string;
    promotionEndDate?: string;
    highlightLevel?: HighlightLevel;
    categoryHighlight?: boolean;
  };
}

export const ProductModal = ({ isOpen, onClose, product }: ProductModalProps) => {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("whatsapp_url")
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { timeRemaining, isExpired } = useCountdown(product.promotionEndDate);

  // Centralized WhatsApp URL
  const whatsappUrl = settings?.whatsapp_url || "https://wa.me/5583999999999";

  const handleComplaintsClick = () => {
    const message = encodeURIComponent("Olá, gostaria de registrar uma reclamação ou sugestão.");
    window.open(`${whatsappUrl}?text=${message}`, "_blank");
  };

  const hasPromo = product.oldPrice && product.oldPrice > 0 && product.oldPrice > product.price && !isExpired;
  const discountPercentage = hasPromo 
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;

  // Category highlight is the primary rule - product inherits highlight from category
  const isHighlightActive = product.categoryHighlight || hasPromo;

  const getTimerPulseClass = () => {
    if (!isHighlightActive) return '';
    const level = product.highlightLevel || 'Leve';
    switch (level) {
      case 'Super Destaque': return 'animate-timer-pulse-super';
      case 'Destaque': return 'animate-timer-pulse-destaque';
      case 'Leve':
      default: return 'animate-timer-pulse-leve';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-white pr-8 leading-tight" style={{ fontWeight: 800 }}>
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
              {product.category}
            </Badge>
            <p className="text-[#b3b3b3] leading-relaxed text-base">
              {product.description}
            </p>
          </div>

          <div className="pt-6 border-t border-border space-y-2">
            {hasPromo && (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-[#ff8c00] text-white hover:bg-[#ff8c00]/90 px-3 py-1 text-sm font-bold">
                    -{discountPercentage}%
                  </Badge>
                  <span className="text-lg text-[#8a8a8a] line-through">
                    R$ {product.oldPrice!.toFixed(2)}
                  </span>
                  {product.promotionName && (
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold">
                      {product.promotionName}
                    </Badge>
                  )}
                </div>
                {timeRemaining && (
                  <div className={cn(
                    "inline-flex items-center gap-1.5 bg-[#ff8c00]/15 text-[#ff8c00] text-sm font-semibold px-3 py-1.5 rounded-full",
                    getTimerPulseClass()
                  )}>
                    <Clock className="h-4 w-4" />
                    <span>Termina em {timeRemaining}</span>
                  </div>
                )}
              </>
            )}
            <div className="text-4xl font-extrabold text-[#00D084]" style={{ fontWeight: 800 }}>
              R$ {product.price.toFixed(2)}
            </div>
          </div>

          {/* Complaints/Suggestions Link - Red and prominent */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleComplaintsClick}
              className="flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors text-sm font-semibold"
            >
              <MessageCircle className="h-4 w-4" />
              Reclamações ou Sugestões
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
