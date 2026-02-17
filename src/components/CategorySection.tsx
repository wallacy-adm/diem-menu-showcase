import { memo, useCallback, useMemo, useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { HighlightLevel } from "@/hooks/useActivePromotions";
import { useOnScreen } from "@/hooks/useOnScreen";
import { cn } from "@/lib/utils";
import { VirtualProductGrid } from "@/components/VirtualProductGrid";

type Category = {
  name: string;
  emoji: string;
  highlight: boolean;
  highlight_level: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price?: number;
  image: string;
  category: string;
  featured?: boolean;
  highlight_level?: string;
  image_position_y?: number;
  image_zoom?: number;
};

type Promotion = {
  discounted_price: number;
  original_price: number;
  name: string;
  end_date: string;
  highlight_level: string;
};

type Props = {
  category: Category;
  items: Product[];
  activePromotions?: Map<string, Promotion>;
  debouncedSearch: string;
  setSectionRef: (name: string, el: HTMLElement | null) => void;
};

export const CategorySection = memo(({ category, items, activePromotions, debouncedSearch, setSectionRef }: Props) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldRenderProducts = useOnScreen(sectionRef);

  const emojiClass = useMemo(() => {
    if (!category.highlight) return "";
    switch (category.highlight_level) {
      case "Super Destaque":
        return "animate-emoji-super";
      case "Destaque":
        return "animate-emoji-destaque";
      default:
        return "animate-emoji-leve";
    }
  }, [category.highlight, category.highlight_level]);

  const sectionGlowClass = useMemo(() => {
    if (!category.highlight) return "";
    switch (category.highlight_level) {
      case "Super Destaque":
        return "animate-category-glow-super rounded-lg px-3 py-1";
      case "Destaque":
        return "animate-category-glow-destaque rounded-lg px-3 py-1";
      default:
        return "animate-category-glow-leve rounded-lg px-3 py-1";
    }
  }, [category.highlight, category.highlight_level]);

  const renderProductItem = useCallback(
    (item: Product) => {
      const promotion = activePromotions?.get(item.id);
      const displayPrice = promotion ? promotion.discounted_price : Number(item.price);
      const displayOldPrice = promotion ? promotion.original_price : (item.old_price ? Number(item.old_price) : undefined);
      const promotionName = promotion ? promotion.name : undefined;
      const promotionEndDate = promotion ? promotion.end_date : undefined;

      const categoryHasHighlight = category.highlight === true;
      const categoryHighlightLevel = category.highlight_level as HighlightLevel;

      const effectiveHighlightLevel: HighlightLevel = promotion
        ? (promotion.highlight_level as HighlightLevel)
        : categoryHasHighlight
          ? categoryHighlightLevel
          : (item.highlight_level as HighlightLevel);

      return (
        <ProductCard
          id={item.id}
          name={item.name}
          description={item.description}
          price={displayPrice}
          oldPrice={displayOldPrice}
          image={item.image}
          category={item.category}
          promotionName={promotionName}
          promotionEndDate={promotionEndDate}
          featured={item.featured}
          highlightLevel={effectiveHighlightLevel}
          categoryHighlight={categoryHasHighlight || !!promotion}
          imagePositionY={item.image_position_y ?? 50}
          imageZoom={item.image_zoom ?? 1.0}
        />
      );
    },
    [activePromotions, category.highlight, category.highlight_level],
  );

  return (
    <section
      key={category.name}
      ref={(el) => {
        sectionRef.current = el;
        setSectionRef(category.name, el);
      }}
      data-category={category.name}
      className="mb-10"
      style={{ scrollMarginTop: "72px" }}
    >
      <h2
        className={cn(
          "text-xl font-extrabold text-white mb-5 uppercase tracking-wide flex items-center gap-2 w-fit",
          sectionGlowClass,
        )}
        style={{ fontWeight: 800 }}
      >
        <span className={`text-2xl ${emojiClass}`}>{category.emoji}</span>
        {category.name}
        <span className={`text-2xl ${emojiClass}`}>{category.emoji}</span>
      </h2>

      {shouldRenderProducts || debouncedSearch.trim() ? (
        <VirtualProductGrid items={items} renderItem={renderProductItem} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: Math.min(4, items.length || 2) }).map((_, index) => (
            <div
              key={`${category.name}-placeholder-${index}`}
              className="h-[172px] rounded-2xl border border-white/[0.06] bg-[#0a0a0a]/70 animate-pulse"
            />
          ))}
        </div>
      )}

      {items.length === 0 && !debouncedSearch && (
        <p className="text-[#b3b3b3] text-sm text-center py-8">Nenhum produto disponível nesta categoria no momento.</p>
      )}
    </section>
  );
});

CategorySection.displayName = "CategorySection";
