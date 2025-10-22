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

  const hasPromo = oldPrice && oldPrice > price;

  return (
    <>
      <article
        className={cn(
          "bg-card rounded-lg border border-border overflow-hidden transition-smooth hover:shadow-card-hover shadow-card group cursor-pointer"
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex gap-4 p-4">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-smooth">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            </div>

            <div className="mt-auto pt-2 flex items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    R$ {price.toFixed(2).replace(".", ",")}
                  </span>
                  {hasPromo && (
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {oldPrice.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </div>
                {hasPromo && (
                  <Badge className="w-fit bg-[hsl(var(--promo))] text-[hsl(var(--promo-foreground))] hover:bg-[hsl(var(--promo))]/90">
                    Promoção
                  </Badge>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                className="flex-shrink-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                aria-label={`Ver detalhes de ${name}`}
              >
                Detalhes
              </Button>
            </div>
          </div>

          <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0 rounded-md overflow-hidden bg-secondary">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-secondary animate-pulse" />
            )}
            <img
              src={image}
              alt={name}
              loading="lazy"
              className={cn(
                "w-full h-full object-cover transition-smooth group-hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div>
      </article>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={{ id, name, description, price, oldPrice, image, category }}
      />
    </>
  );
};
