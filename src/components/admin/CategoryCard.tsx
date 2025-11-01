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
    <Card className="bg-card border-border overflow-hidden">
      {/* Category Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-1">Nome da categoria</div>
          <div className="font-semibold text-foreground">
            {category.name}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
            {category.productCount}
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="hover:bg-secondary"
            >
              <MoreVertical className="w-4 h-4" />
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
            className="hover:bg-secondary"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            + Produto
          </Button>
          
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
