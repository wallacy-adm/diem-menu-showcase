import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductModal } from "./ProductModal";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  oldPrice,
  image,
  category,
}: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasPromotion = oldPrice && oldPrice > price;
  const discountPercentage = hasPromotion 
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  return (
    <>
      <div 
        className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-border/30 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex gap-4 p-4">
          {/* Content Left */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Product Info */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {description}
              </p>
            </div>

            {/* Price Section */}
            <div className="flex flex-col gap-1">
              {hasPromotion && (
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-[hsl(var(--discount-badge))] text-white text-xs font-bold px-2 py-0.5 rounded">
                    -{discountPercentage}%
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    R$ {oldPrice?.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="text-2xl font-extrabold text-[hsl(var(--primary))]">
                R$ {price.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Image Right */}
          <div className="w-[120px] h-[120px] flex-shrink-0">
            <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-muted">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <img
                src={image || "/placeholder.svg"}
                alt={name}
                onLoad={() => setImageLoaded(true)}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={{ id, name, description, price, oldPrice, image, category }}
      />
    </>
  );
};
