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
      className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
      onClick={() => onEdit(product)}
    >
      {/* Product Image */}
      <img 
        src={product.image}
        alt={product.name}
        className="w-16 h-16 rounded-lg object-cover"
      />
      
      {/* Product Info */}
      <div className="flex-1">
        <div className="font-medium text-foreground mb-1">{product.name}</div>
        <div className="flex items-center gap-2">
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {product.oldPrice.toFixed(2)}
            </span>
          )}
          <span className="text-sm font-semibold text-primary">
            R$ {product.price.toFixed(2)}
          </span>
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
          className="hover:bg-muted"
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
