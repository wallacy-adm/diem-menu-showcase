import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  categories: Array<{ name: string; emoji: string; highlight?: boolean }>;
  activeCategory: string;
  onCategoryClick: (category: string) => void;
}

export const CategoryChips = ({
  categories,
  activeCategory,
  onCategoryClick,
}: CategoryChipsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Auto-scroll to center the active chip
  useEffect(() => {
    if (!activeCategory || !scrollContainerRef.current) return;

    const chip = chipRefs.current.get(activeCategory);
    if (!chip) return;

    const container = scrollContainerRef.current;
    const chipRect = chip.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const chipCenter = chipRect.left + chipRect.width / 2;
    const containerCenter = containerRect.left + containerRect.width / 2;
    const scrollOffset = chipCenter - containerCenter;

    container.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  }, [activeCategory]);

  return (
    <nav className="sticky top-0 z-40 bg-[#0C0C0C] border-b border-[#1f1f1f]">
      <div
        ref={scrollContainerRef}
        className="flex gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        role="tablist"
        aria-label="Categorias"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.name;
          const isHighlighted = category.highlight && !isActive;
          
          return (
            <button
              key={category.name}
              ref={(el) => {
                if (el) chipRefs.current.set(category.name, el);
              }}
              onClick={() => onCategoryClick(category.name)}
              className={cn(
                "whitespace-nowrap px-3.5 py-2.5 rounded-full text-[14px] transition-all flex-shrink-0",
                isActive
                  ? "bg-[#00D084] text-black border border-[#00D084] shadow-[0_2px_0_0_#00D084]"
                  : isHighlighted
                    ? "bg-[#14161a] text-white border border-[#00D084]/50 animate-highlight-glow"
                    : "bg-[#14161a] text-white border border-[#2a2f36]"
              )}
              style={{
                fontWeight: isActive ? 800 : isHighlighted ? 600 : 400,
              }}
              role="tab"
              aria-selected={isActive}
              aria-label={`Ver categoria ${category.name}`}
            >
              {category.emoji} {category.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
