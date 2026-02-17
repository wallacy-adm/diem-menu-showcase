import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuHeader } from "@/components/MenuHeader";
import { CategoryChips } from "@/components/CategoryChips";
import { ProductCard } from "@/components/ProductCard";
import { MenuFooter } from "@/components/MenuFooter";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useActivePromotions, HighlightLevel } from "@/hooks/useActivePromotions";
import { cn } from "@/lib/utils";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isManualScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Debounce para a busca - evita re-renderizações pesadas a cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: menuItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: activePromotions } = useActivePromotions();

  const isLoading = categoriesLoading || itemsLoading;

  // Filter items by debounced search query
  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    if (!debouncedSearch.trim()) return menuItems;
    const query = debouncedSearch.toLowerCase().trim();
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      (item.description && item.description.toLowerCase().includes(query))
    );
  }, [menuItems, debouncedSearch]);

  const groupedItems = useMemo(() => {
    return filteredItems?.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof filteredItems>);
  }, [filteredItems]);

  // Intersection Observer para detectar categoria ativa (muito mais performático que scroll event)
  useEffect(() => {
    if (!categories || categories.length === 0 || debouncedSearch) return;

    const options = {
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (isManualScrollRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const category = entry.target.getAttribute('data-category');
          if (category) setActiveCategory(category);
        }
      });
    }, options);

    sectionRefs.current.forEach((el) => {
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [categories, debouncedSearch]);

  const handleCategoryClick = useCallback((category: string) => {
    const element = sectionRefs.current.get(category);
    if (!element) return;

    isManualScrollRef.current = true;
    setActiveCategory(category);

    const navHeight = 56;
    const buffer = 16;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - navHeight - buffer;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isManualScrollRef.current = false;
    }, 800);
  }, []);

  const setSectionRef = useCallback((name: string, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(name, el);
      if (observerRef.current && !debouncedSearch) {
        observerRef.current.observe(el);
      }
    } else {
      sectionRefs.current.delete(name);
    }
  }, [debouncedSearch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader />
      <CategoryChips
        categories={categories.map((cat) => ({ 
          name: cat.name, 
          emoji: cat.emoji,
          highlight: cat.highlight,
          highlight_level: cat.highlight_level as 'Leve' | 'Destaque' | 'Super Destaque'
        }))}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      <div className="container mx-auto px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-black/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-primary/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {categories.map((category) => {
          const items = groupedItems?.[category.name] || [];
          if (debouncedSearch.trim() && items.length === 0) return null;

          return (
            <section
              key={category.name}
              ref={(el) => setSectionRef(category.name, el)}
              data-category={category.name}
              className="mb-10"
              style={{ scrollMarginTop: "72px" }}
            >
              {(() => {
                const getEmojiClass = () => {
                  if (!category.highlight) return '';
                  switch (category.highlight_level) {
                    case 'Super Destaque': return 'animate-emoji-super';
                    case 'Destaque': return 'animate-emoji-destaque';
                    case 'Leve':
                    default: return 'animate-emoji-leve';
                  }
                };
                
                const getSectionGlowClass = () => {
                  if (!category.highlight) return '';
                  switch (category.highlight_level) {
                    case 'Super Destaque': return 'animate-category-glow-super rounded-lg px-3 py-1';
                    case 'Destaque': return 'animate-category-glow-destaque rounded-lg px-3 py-1';
                    case 'Leve':
                    default: return 'animate-category-glow-leve rounded-lg px-3 py-1';
                  }
                };
                
                const emojiClass = getEmojiClass();
                const sectionGlowClass = getSectionGlowClass();
                
                return (
                  <h2
                    className={cn(
                      "text-xl font-extrabold text-white mb-5 uppercase tracking-wide flex items-center gap-2 w-fit",
                      sectionGlowClass
                    )}
                    style={{ fontWeight: 800 }}
                  >
                    <span className={`text-2xl ${emojiClass}`}>{category.emoji}</span>
                    {category.name}
                    <span className={`text-2xl ${emojiClass}`}>{category.emoji}</span>
                  </h2>
                );
              })()}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {items.map((item) => {
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
                  
                  const forceHighlightFromPromotion = !!promotion;
                  
                  return (
                    <ProductCard
                      key={item.id}
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
                      categoryHighlight={categoryHasHighlight || forceHighlightFromPromotion}
                      imagePositionY={item.image_position_y ?? 50}
                      imageZoom={item.image_zoom ?? 1.0}
                    />
                  );
                })}
              </div>
              {items.length === 0 && !debouncedSearch && (
                <p className="text-[#b3b3b3] text-sm text-center py-8">
                  Nenhum produto disponível nesta categoria no momento.
                </p>
              )}
            </section>
          );
        })}
      </main>

      <MenuFooter />
    </div>
  );
};

export default Index;
