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
  const discountPercentage = hasPromo 
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground pr-8 leading-tight">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
              {product.category}
            </Badge>
            <p className="text-muted-foreground leading-relaxed text-base">
              {product.description}
            </p>
          </div>

          <div className="pt-6 border-t border-border space-y-2">
            {hasPromo && (
              <div className="flex items-center gap-3">
                <Badge className="bg-[hsl(var(--discount-badge))] text-white hover:bg-[hsl(var(--discount-badge))]/90 px-3 py-1 text-sm font-bold">
                  -{discountPercentage}%
                </Badge>
                <span className="text-lg text-muted-foreground line-through">
                  R$ {product.oldPrice!.toFixed(2)}
                </span>
              </div>
            )}
            <div className="text-4xl font-extrabold text-[hsl(var(--primary))]">
              R$ {product.price.toFixed(2)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
