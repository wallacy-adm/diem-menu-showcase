import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Centralized WhatsApp URL
  const whatsappUrl = settings?.whatsapp_url || "https://wa.me/5583999999999";

  const handleComplaintsClick = () => {
    const message = encodeURIComponent("Olá, gostaria de registrar uma reclamação ou sugestão.");
    window.open(`${whatsappUrl}?text=${message}`, "_blank");
  };

  const hasPromo = product.oldPrice && product.oldPrice > product.price;
  const discountPercentage = hasPromo 
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;

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
              <div className="flex items-center gap-3">
                <Badge className="bg-[#ff8c00] text-white hover:bg-[#ff8c00]/90 px-3 py-1 text-sm font-bold">
                  -{discountPercentage}%
                </Badge>
                <span className="text-lg text-[#8a8a8a] line-through">
                  R$ {product.oldPrice!.toFixed(2)}
                </span>
              </div>
            )}
            <div className="text-4xl font-extrabold text-[#00D084]" style={{ fontWeight: 800 }}>
              R$ {product.price.toFixed(2)}
            </div>
          </div>

          {/* Complaints/Suggestions Link */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleComplaintsClick}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
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
