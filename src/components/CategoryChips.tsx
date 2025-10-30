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
    <div className="sticky top-0 z-40 bg-[#0C0C0C] border-b border-[#2a2f36] shadow-lg">
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
                "px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-2 max-w-[200px] overflow-hidden text-ellipsis",
                activeCategory === category.name
                  ? "bg-[#00D084] text-black border-[#00D084] shadow-md border-b-4"
                  : "bg-[#14161a] text-white border-[#2a2f36] hover:bg-[#1a1d23]"
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
