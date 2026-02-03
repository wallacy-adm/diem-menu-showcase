import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuHeader } from "@/components/MenuHeader";
import { CategoryChips } from "@/components/CategoryChips";
import { ProductCard } from "@/components/ProductCard";
import { MenuFooter } from "@/components/MenuFooter";
import { Loader2, Search, X, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActivePromotions, HighlightLevel } from "@/hooks/useActivePromotions";
import { cn } from "@/lib/utils";
import { useSessionCache } from "@/hooks/useSessionCache";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isManualScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Session cache hooks for instant loading
  const categoriesCache = useSessionCache<any[]>('categories');
  const menuItemsCache = useSessionCache<any[]>('menuItems');

  // Get initial data from cache ONCE on mount for instant rendering
  const cachedCategories = useMemo(() => categoriesCache.getCache(), []);
  const cachedMenuItems = useMemo(() => menuItemsCache.getCache(), []);

  // Fetch categories - single call with cache hydration
  const { 
    data: categories, 
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      
      // Update cache on successful fetch
      if (data && data.length > 0) {
        categoriesCache.setCache(data);
      }
      return data;
    },
    initialData: cachedCategories || undefined,
    staleTime: 60000, // 1 minute - increased to reduce refetches
    gcTime: 300000, // 5 minutes cache retention
    refetchOnWindowFocus: false,
    refetchOnMount: !cachedCategories, // Only refetch on mount if no cache
  });

  // Fetch menu items - single call with cache hydration
  const { 
    data: menuItems, 
    isLoading: itemsLoading,
    isError: itemsError,
    refetch: refetchItems
  } = useQuery({
    queryKey: ["menuItems"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      
      // Update cache on successful fetch
      if (data && data.length > 0) {
        menuItemsCache.setCache(data);
      }
      return data;
    },
    initialData: cachedMenuItems || undefined,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes cache retention
    refetchOnWindowFocus: false,
    refetchOnMount: !cachedMenuItems, // Only refetch on mount if no cache
  });

  const { data: activePromotions } = useActivePromotions();

  // Check if we have displayable data (from cache or fresh fetch)
  const hasDisplayableData = categories && categories.length > 0 && menuItems && menuItems.length > 0;
  
  // Only show loading on FIRST load when no cache exists
  const isInitialLoading = (categoriesLoading || itemsLoading) && !hasDisplayableData;
  const hasError = (categoriesError || itemsError) && !hasDisplayableData;
  const isReady = hasDisplayableData;

  // Manual retry handler
  const handleRetry = useCallback(() => {
    refetchCategories();
    refetchItems();
  }, [refetchCategories, refetchItems]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    if (!searchQuery.trim()) return menuItems;
    const query = searchQuery.toLowerCase().trim();
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(query)
    );
  }, [menuItems, searchQuery]);

  const groupedItems = useMemo(() => {
    if (!filteredItems || !categories) return {};
    return filteredItems.reduce((acc, item) => {
      // Only group items into categories that actually exist
      const categoryExists = categories.some(cat => cat.name === item.category);
      if (categoryExists) {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
      }
      return acc;
    }, {} as Record<string, typeof filteredItems>);
  }, [filteredItems, categories]);

  // Calculate active category based on scroll position
  const calculateActiveCategory = useCallback(() => {
    if (!categories || categories.length === 0) return;

    const navHeight = 72; // header + category bar height
    const scrollPosition = window.scrollY + navHeight + 20;

    let currentCategory = categories[0].name;

    for (const category of categories) {
      const element = sectionRefs.current.get(category.name);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        
        if (elementTop <= scrollPosition) {
          currentCategory = category.name;
        }
      }
    }

    setActiveCategory(currentCategory);
  }, [categories]);

  // Click handler - scroll to section
  const handleCategoryClick = useCallback((category: string) => {
    const element = sectionRefs.current.get(category);
    if (!element) return;

    // Set manual scroll flag
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

    // Clear manual scroll flag after animation completes
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isManualScrollRef.current = false;
      // Recalculate to sync with actual position
      calculateActiveCategory();
    }, 600);
  }, [calculateActiveCategory]);

  // Touch/wheel event - immediately release manual scroll lock
  useEffect(() => {
    const releaseManualScroll = () => {
      if (isManualScrollRef.current) {
        isManualScrollRef.current = false;
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
      }
    };

    // Listen for user-initiated scroll gestures
    window.addEventListener("touchmove", releaseManualScroll, { passive: true });
    window.addEventListener("wheel", releaseManualScroll, { passive: true });

    return () => {
      window.removeEventListener("touchmove", releaseManualScroll);
      window.removeEventListener("wheel", releaseManualScroll);
    };
  }, []);

  // Scroll event handler with throttle
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    let ticking = false;

    const handleScroll = () => {
      // Skip only if manual scroll is active
      if (isManualScrollRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateActiveCategory();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Set initial category
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0].name);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [categories, calculateActiveCategory, activeCategory]);

  // Register section ref
  const setSectionRef = useCallback((name: string, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(name, el);
    }
  }, []);

  // Loading state - only on first load without cache
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Carregando cardápio…</p>
      </div>
    );
  }

  // Error state
  if (hasError || !isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center gap-4">
        <p className="text-muted-foreground text-sm max-w-xs">
          Não foi possível carregar o cardápio. Toque para tentar novamente.
        </p>
        <Button 
          onClick={handleRetry}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
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

      {/* Search Field */}
      <div className="container mx-auto px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-black/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl"
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
          
          // Hide category completely if no items match during search
          if (searchQuery.trim() && items.length === 0) {
            return null;
          }

          return (
            <section
              key={category.name}
              ref={(el) => setSectionRef(category.name, el)}
              data-category={category.name}
              className="mb-10"
              style={{ scrollMarginTop: "72px" }}
            >
              {(() => {
                // Get emoji animation class for section header
                const getEmojiClass = () => {
                  if (!category.highlight) return '';
                  switch (category.highlight_level) {
                    case 'Super Destaque': return 'animate-emoji-super';
                    case 'Destaque': return 'animate-emoji-destaque';
                    case 'Leve':
                    default: return 'animate-emoji-leve';
                  }
                };
                
                // Get section header glow class based on highlight level
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

              {items.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  {items.map((item) => {
                    // Check if this product has an active promotion
                    const promotion = activePromotions?.get(item.id);
                    const displayPrice = promotion ? promotion.discounted_price : Number(item.price);
                    const displayOldPrice = promotion ? promotion.original_price : (item.old_price ? Number(item.old_price) : undefined);
                    const promotionName = promotion ? promotion.name : undefined;
                    const promotionEndDate = promotion ? promotion.end_date : undefined;
                    
                    // Category highlight is the primary rule - if category has highlight, product inherits it
                    const categoryHasHighlight = category.highlight === true;
                    const categoryHighlightLevel = category.highlight_level as HighlightLevel;
                    
                    // If product has active promotion, highlight is ALWAYS applied
                    // Use promotion's highlight level when there's an active promotion
                    // Otherwise use category's highlight level (if category has highlight)
                    // Otherwise use product's own highlight level
                    const effectiveHighlightLevel: HighlightLevel = promotion 
                      ? (promotion.highlight_level as HighlightLevel)
                      : categoryHasHighlight 
                        ? categoryHighlightLevel 
                        : (item.highlight_level as HighlightLevel);
                    
                    // Active promotion forces highlight to be visible
                    const forceHighlightFromPromotion = !!promotion;
                    
                    // Product highlight_enabled from database
                    const productHighlightEnabled = (item as any).highlight_enabled === true;
                    
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
                        highlightEnabled={productHighlightEnabled || forceHighlightFromPromotion}
                        categoryHighlight={categoryHasHighlight || forceHighlightFromPromotion}
                        imagePositionY={item.image_position_y ?? 50}
                        imageZoom={item.image_zoom ?? 1.0}
                      />
                    );
                  })}
                </div>
              ) : (
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
