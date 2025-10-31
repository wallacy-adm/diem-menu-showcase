import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

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
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const hasPromo = product.oldPrice && product.oldPrice > product.price;
  const discountPercentage = hasPromo
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    }, quantity);
    onClose();
    setQuantity(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {hasPromo && (
              <Badge className="absolute top-3 right-3 bg-promo text-promo-foreground text-sm font-bold px-3 py-1">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/80 uppercase tracking-wide">
              {product.category}
            </DialogDescription>
          </DialogHeader>

          <p className="text-foreground/90 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-3xl font-extrabold text-primary">
              R$ {product.price.toFixed(2)}
            </span>
            {hasPromo && (
              <span className="text-lg text-muted-foreground line-through">
                R$ {product.oldPrice!.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-3 bg-secondary rounded-lg p-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="flex-1"
              size="lg"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </div>

          <p className="text-xs text-muted-foreground/70 text-center mt-6 border-t border-border/50 pt-4">
            * Imagens meramente ilustrativas. Consulte a disponibilidade dos produtos no momento do pedido.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
