import { useRef } from "react";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  categories: Array<{ name: string; emoji: string }>;
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
    <div className="sticky top-0 z-40 bg-background border-b border-border/50 shadow-lg">
      <div
        ref={scrollContainerRef}
        className="container mx-auto px-4 py-3 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-2 min-w-max">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onCategoryClick(category.name)}
              className={cn(
                "px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all border-2 flex items-center gap-2",
                activeCategory === category.name
                  ? "bg-primary text-black border-primary shadow-md"
                  : "bg-card/50 text-foreground border-transparent hover:bg-card hover:border-border"
              )}
              aria-label={`Ver categoria ${category.name}`}
            >
              <span className="text-base">{category.emoji}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
