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
    <div className="sticky top-[88px] md:top-[96px] z-40 bg-background/95 backdrop-blur-sm border-b border-border py-3 shadow-sm">
      <div
        ref={scrollContainerRef}
        className="container mx-auto px-4 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-2 min-w-max pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryClick(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-smooth border",
                activeCategory === category
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 hover:border-primary/50"
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
