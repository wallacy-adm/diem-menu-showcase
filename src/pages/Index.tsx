import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuHeader } from "@/components/MenuHeader";
import { CategoryChips } from "@/components/CategoryChips";
import { MenuFooter } from "@/components/MenuFooter";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useActivePromotions } from "@/hooks/useActivePromotions";
import { useDebounce } from "@/hooks/useDebounce";
import { CategorySection } from "@/components/CategorySection";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostPaint, setIsPostPaint] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isManualScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

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

  useEffect(() => {
    const id = window.setTimeout(() => setIsPostPaint(true), 350);
    return () => window.clearTimeout(id);
  }, []);

  const { data: activePromotions } = useActivePromotions(isPostPaint);

  const isLoading = categoriesLoading || itemsLoading;

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    if (!debouncedSearch.trim()) return menuItems;
    const query = debouncedSearch.toLowerCase().trim();
    return menuItems.filter(
      (item) => item.name.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query)),
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

  useEffect(() => {
    if (!categories || categories.length === 0 || debouncedSearch) return;

    const options = {
      rootMargin: "-80px 0px -70% 0px",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (isManualScrollRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const category = entry.target.getAttribute("data-category");
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

  const setSectionRef = useCallback(
    (name: string, el: HTMLElement | null) => {
      if (el) {
        sectionRefs.current.set(name, el);
        if (observerRef.current && !debouncedSearch) {
          observerRef.current.observe(el);
        }
      } else {
        sectionRefs.current.delete(name);
      }
    },
    [debouncedSearch],
  );


  const categoryChips = useMemo(() =>
    (categories ?? []).map((cat) => ({
      name: cat.name,
      emoji: cat.emoji,
      highlight: cat.highlight,
      highlight_level: cat.highlight_level as "Leve" | "Destaque" | "Super Destaque",
    })),
  [categories]);

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
        categories={categoryChips}
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

      <MenuFooter />
    </div>
  );
};

export default Index;
