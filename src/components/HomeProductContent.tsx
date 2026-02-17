import { memo } from "react";
import { CategorySection } from "@/components/CategorySection";

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

interface HomeProductContentProps {
  categories: Category[];
  groupedItems: Record<string, Product[]>;
  activePromotions?: Map<string, Promotion>;
  debouncedSearch: string;
  setSectionRef: (name: string, el: HTMLElement | null) => void;
}

export const HomeProductContent = memo(
  ({ categories, groupedItems, activePromotions, debouncedSearch, setSectionRef }: HomeProductContentProps) => {
    return (
      <main className="container mx-auto px-4 py-6">
        {categories.map((category) => {
          const items = groupedItems?.[category.name] || [];
          if (debouncedSearch.trim() && items.length === 0) return null;

          return (
            <CategorySection
              key={category.name}
              category={category}
              items={items}
              activePromotions={activePromotions}
              debouncedSearch={debouncedSearch}
              setSectionRef={setSectionRef}
            />
          );
        })}
      </main>
    );
  },
);

HomeProductContent.displayName = "HomeProductContent";
