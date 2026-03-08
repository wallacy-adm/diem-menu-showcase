import { useEffect, useRef, useState, memo, lazy, Suspense } from "react";
import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/useCountdown";
import { Clock } from "lucide-react";
import type { HighlightLevel } from "@/hooks/useActivePromotions";
import { supabase } from "@/integrations/supabase/client";

const ProductModal = lazy(() => import("./ProductModal").then((module) => ({ default: module.ProductModal })));

const imageCache = new Map<string, string | null>();

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image?: string;
  category: string;
  promotionName?: string;
  promotionEndDate?: string;
  featured?: boolean;
  highlightLevel?: HighlightLevel;
  categoryHighlight?: boolean;
  imagePositionY?: number;
  imageZoom?: number;
}

export const ProductCard = memo(({
  id,
  name,
  description,
  price,
  oldPrice,
  image,
  category,
  promotionName,
  promotionEndDate,
  featured,
  highlightLevel = "Leve",
  categoryHighlight = false,
  imagePositionY = 50,
  imageZoom = 1.0,
}: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cachedImage = imageCache.get(id);
  const [loadedImage, setLoadedImage] = useState<string | null>(image ?? cachedImage ?? null);
  const [shouldLoadImage, setShouldLoadImage] = useState(Boolean(image ?? cachedImage));
  const [hasFetchedImage, setHasFetchedImage] = useState(Boolean(image ?? cachedImage));
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { timeRemaining, isExpired } = useCountdown(promotionEndDate);

  useEffect(() => {
    if (image) {
      imageCache.set(id, image);
      setLoadedImage(image);
      setShouldLoadImage(true);
      setHasFetchedImage(true);
      return;
    }

    if (cachedImage !== undefined) {
      setLoadedImage(cachedImage);
      setShouldLoadImage(true);
      setHasFetchedImage(true);
      return;
    }

    if (!cardRef.current || hasFetchedImage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadImage(true);
            observer.disconnect();
          }
        });
      },
      {
        root: null,
        threshold: 0.01,
      },
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
    };
  }, [cachedImage, hasFetchedImage, id, image]);

  useEffect(() => {
    if (!shouldLoadImage || hasFetchedImage) return;

    let isCancelled = false;

    const fetchImage = async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("image")
        .eq("id", id)
        .single();

      if (isCancelled) return;

      if (!error) {
        const nextImage = data?.image ?? null;
        imageCache.set(id, nextImage);
        setLoadedImage(nextImage);
      }

      setHasFetchedImage(true);
    };

    void fetchImage();

    return () => {
      isCancelled = true;
    };
  }, [hasFetchedImage, id, shouldLoadImage]);

  const hasPromotion = oldPrice && oldPrice > 0 && oldPrice > price && !isExpired;
  const discountPercentage = hasPromotion ? Math.round(((oldPrice! - price) / oldPrice!) * 100) : 0;

  const displayPrice = isExpired && oldPrice ? oldPrice : price;
  const isHighlightActive = hasPromotion || categoryHighlight || (featured && highlightLevel !== "Desligado");
  const effectiveHighlightLevel = highlightLevel;

  const getProductPulseClass = () => {
    if (!isHighlightActive) return "";
    if (effectiveHighlightLevel === "Desligado" && !hasPromotion) return "";
    switch (effectiveHighlightLevel) {
      case "Super Destaque":
        return "animate-product-pulse-super";
      case "Destaque":
        return "animate-product-pulse-destaque";
      case "Leve":
      default:
        return "animate-product-pulse-leve";
    }
  };

  const getTimerPulseClass = () => {
    if (effectiveHighlightLevel === "Desligado") return "animate-timer-pulse-leve";
    switch (effectiveHighlightLevel) {
      case "Super Destaque":
        return "animate-timer-pulse-super";
      case "Destaque":
        return "animate-timer-pulse-destaque";
      case "Leve":
      default:
        return "animate-timer-pulse-leve";
    }
  };

  const shouldShowModal = isModalOpen;

  return (
    <>
      <div
        ref={cardRef}
        className={cn(
          "bg-[#0a0a0a] rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer touch-manipulation",
          "shadow-[0_2px_12px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.3)]",
          "hover:shadow-[0_4px_20px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,212,132,0.1)]",
          "border border-white/[0.06]",
          "active:scale-[0.99] active:opacity-95",
          "[content-visibility:auto] [contain-intrinsic-size:172px]",
          getProductPulseClass()
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex gap-3 p-4 md:p-5 min-h-[140px]">
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div className="space-y-1.5">
              <h3 className="text-[16px] md:text-[18px] font-extrabold text-white leading-snug line-clamp-2 tracking-[-0.01em]">
                {name}
              </h3>
              <p className="text-[13px] md:text-sm text-muted-foreground leading-relaxed line-clamp-3">{description}</p>
            </div>

            <div className="flex flex-col gap-1.5 mt-3">
              {hasPromotion && (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] text-muted-foreground/70 line-through">R$ {oldPrice?.toFixed(2)}</span>
                    <span className="bg-white text-[#ff8c00] text-[11px] font-bold px-2 py-0.5 rounded">-{discountPercentage}%</span>
                    {promotionName && (
                      <span className="bg-primary text-primary-foreground text-[11px] font-bold px-2 py-0.5 rounded">{promotionName}</span>
                    )}
                  </div>
                  {timeRemaining && (
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 bg-[#ff8c00]/15 text-[#ff8c00] text-[11px] font-semibold px-2.5 py-1 rounded-full",
                        getTimerPulseClass(),
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      <span>Termina em {timeRemaining}</span>
                    </div>
                  )}
                </>
              )}
              <div className="text-xl md:text-2xl font-extrabold text-primary tracking-tight">R$ {displayPrice.toFixed(2)}</div>
            </div>
          </div>

          <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] flex-shrink-0 self-center">
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-secondary/50">
              {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-muted/35" />}
              {shouldLoadImage ? (
                <img
                  src={loadedImage || "/placeholder.svg"}
                  alt={name}
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="120"
                  onLoad={() => setImageLoaded(true)}
                  style={{
                    objectPosition: `center ${imagePositionY}%`,
                    transform: `scale(${imageZoom})`,
                    transformOrigin: `center ${imagePositionY}%`,
                  }}
                  className={cn("w-full h-full object-cover transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {shouldShowModal ? (
        <Suspense fallback={null}>
          <ProductModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            product={{
              id,
              name,
              description,
              price: displayPrice,
              oldPrice: hasPromotion ? oldPrice : undefined,
              image: loadedImage || "/placeholder.svg",
              category,
              promotionName: hasPromotion ? promotionName : undefined,
              promotionEndDate: hasPromotion ? promotionEndDate : undefined,
              highlightLevel: isHighlightActive ? highlightLevel : undefined,
              categoryHighlight,
            }}
          />
        </Suspense>
      ) : null}
    </>
  );
});

ProductCard.displayName = "ProductCard";
