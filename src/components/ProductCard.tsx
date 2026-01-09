import { useState } from "react";
import { ProductModal } from "./ProductModal";
import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/useCountdown";
import { Clock } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  promotionName?: string;
  promotionEndDate?: string;
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  oldPrice,
  image,
  category,
  promotionName,
  promotionEndDate,
}: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { timeRemaining, isExpired } = useCountdown(promotionEndDate);

  const hasPromotion = oldPrice && oldPrice > 0 && oldPrice > price && !isExpired;
  const discountPercentage = hasPromotion 
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  // If promotion expired, show original price
  const displayPrice = isExpired && oldPrice ? oldPrice : price;

  return (
    <>
      <div 
        className="bg-black rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-border/30 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex gap-4 p-4">
          {/* Content Left */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Product Info */}
            <div>
              <h3 className="text-[17px] md:text-[18px] font-extrabold text-white mb-2 line-clamp-2" style={{ fontWeight: 800 }}>
                {name}
              </h3>
              <p className="text-sm text-[#b3b3b3] line-clamp-3 mb-3">
                {description}
              </p>
            </div>

            {/* Price Section */}
            <div className="flex flex-col gap-1">
              {hasPromotion && (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-[#8a8a8a] line-through">
                      R$ {oldPrice?.toFixed(2)}
                    </span>
                    <span className="bg-white text-[#ff8c00] text-xs font-bold px-2 py-0.5 rounded">
                      -{discountPercentage}%
                    </span>
                    {promotionName && (
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
                        {promotionName}
                      </span>
                    )}
                  </div>
                  {timeRemaining && (
                    <div className="inline-flex items-center gap-1.5 bg-white/95 text-[#ff8c00] text-xs font-medium px-2.5 py-1 rounded-full mt-2 shadow-sm">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Termina em {timeRemaining}</span>
                    </div>
                  )}
                </>
              )}
              <div className="text-2xl font-extrabold text-[#00D084]" style={{ fontWeight: 800 }}>
                R$ {displayPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Image Right */}
          <div className="w-[120px] h-[120px] flex-shrink-0 relative">
            <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-muted">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <img
                src={image || "/placeholder.svg"}
                alt={name}
                loading="lazy"
                width="120"
                height="120"
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
        product={{ id, name, description, price: displayPrice, oldPrice: hasPromotion ? oldPrice : undefined, image, category, promotionName: hasPromotion ? promotionName : undefined }}
      />
    </>
  );
};
