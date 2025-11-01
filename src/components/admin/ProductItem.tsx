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
      className="flex items-center gap-3 p-2 bg-white cursor-pointer border-b"
      onClick={() => onEdit(product)}
      style={{ borderColor: '#E5E5EA' }}
    >
      {/* Product Image */}
      <img 
        src={product.image}
        alt={product.name}
        className="w-[44px] h-[44px] object-cover"
        style={{ borderRadius: '8px' }}
      />
      
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm" style={{ color: '#1C1C1E' }}>
          {product.name}
        </div>
      </div>
      
      {/* Prices */}
      <div className="flex flex-col items-end gap-0.5">
        {product.oldPrice && (
          <span className="text-xs line-through" style={{ color: '#8A8A8E' }}>
            R$ {product.oldPrice.toFixed(2)}
          </span>
        )}
        <span className="text-sm font-regular" style={{ color: '#1C1C1E' }}>
          R$ {product.price.toFixed(2)}
        </span>
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
          className="w-8 h-8"
        >
          <MoreVertical className="w-4 h-4" style={{ color: '#8A8A8E' }} />
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
