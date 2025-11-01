import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductMenu } from "./ProductMenu";

interface ProductItemProps {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    oldPrice?: number;
    visible: boolean;
  };
  onEdit: (product: any) => void;
}

export function ProductItem({ product, onEdit }: ProductItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div 
      className="flex items-center gap-3 p-2 bg-card rounded-lg border border-border/30 hover:border-border transition-colors cursor-pointer"
      onClick={() => onEdit(product)}
    >
      {/* Product Image */}
      <img 
        src={product.image}
        alt={product.name}
        className="w-14 h-14 rounded-lg object-cover"
      />
      
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-foreground text-sm mb-1">{product.name}</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            R$ {product.price.toFixed(2)}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              R$ {product.oldPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="hover:bg-muted w-8 h-8"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
        
        {menuOpen && (
          <ProductMenu 
            visible={product.visible}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
