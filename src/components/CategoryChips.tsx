import { useRef } from "react";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  categories: string[];
  activeCategory: string;
  onCategoryClick: (category: string) => void;
}

export const CategoryChips = ({
  categories,
  activeCategory,
  onCategoryClick,
}: CategoryChipsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="sticky top-[88px] md:top-[96px] z-40 bg-background/98 backdrop-blur-md border-b border-border py-4 shadow-sm">
      <div
        ref={scrollContainerRef}
        className="container mx-auto px-4 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-3 min-w-max pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryClick(category)}
              className={cn(
                "px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-smooth",
                activeCategory === category
                  ? "bg-primary text-black shadow-lg scale-105"
                  : "bg-secondary/60 text-foreground hover:bg-secondary hover:scale-102 border border-border/50"
              )}
              aria-label={`Ver categoria ${category}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
