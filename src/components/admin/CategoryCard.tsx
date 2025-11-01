import { useState } from "react";
import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductItem } from "./ProductItem";
import { CategoryMenu } from "./CategoryMenu";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    emoji: string;
    productCount: number;
    products: any[];
  };
  onEditProduct: (product: any) => void;
}

export function CategoryCard({ category, onEditProduct }: CategoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Card 
      className="bg-white overflow-hidden"
      style={{ 
        borderRadius: '12px',
        border: '1px solid #E5E5EA',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Category Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs mb-1" style={{ color: '#8A8A8E' }}>Nome da categoria</div>
          <div className="font-bold uppercase text-sm" style={{ color: '#1C1C1E' }}>
            {category.name}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ 
              backgroundColor: '#E5E5EA',
              color: '#1C1C1E'
            }}
          >
            {category.productCount}
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="hover:bg-secondary w-8 h-8"
            >
              <MoreVertical className="w-4 h-4" style={{ color: '#8A8A8E' }} />
            </Button>
            
            {menuOpen && (
              <CategoryMenu 
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: '#E5E5EA' }}
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5" style={{ color: '#8A8A8E' }} />
            ) : (
              <ChevronDown className="w-5 h-5" style={{ color: '#8A8A8E' }} />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="bg-white px-4 py-3 space-y-3 border-t" style={{ borderColor: '#E5E5EA' }}>
          <button className="text-sm font-medium" style={{ color: '#007AFF' }}>
            + Produto
          </button>
          
          <div className="space-y-2">
            {category.products.map((product) => (
              <ProductItem 
                key={product.id}
                product={product}
                onEdit={onEditProduct}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
