import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const hasPromo = product.oldPrice && product.oldPrice > product.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground pr-8">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <Badge variant="secondary" className="mb-3">
              {product.category}
            </Badge>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-baseline gap-3 pt-4 border-t border-border">
            <span className="text-3xl font-bold text-primary">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            {hasPromo && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  R$ {product.oldPrice!.toFixed(2).replace(".", ",")}
                </span>
                <Badge className="bg-[hsl(var(--promo))] text-[hsl(var(--promo-foreground))] hover:bg-[hsl(var(--promo))]/90">
                  Promoção
                </Badge>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
