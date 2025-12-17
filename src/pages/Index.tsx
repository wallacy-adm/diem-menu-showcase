import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuHeader } from "@/components/MenuHeader";
import { CategoryChips } from "@/components/CategoryChips";
import { ProductCard } from "@/components/ProductCard";
import { MenuFooter } from "@/components/MenuFooter";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isManualScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const isLoading = categoriesLoading || itemsLoading;

  const groupedItems = menuItems?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

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

  // Scroll event handler with throttle
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    let ticking = false;

    const handleScroll = () => {
      // If manual scroll just happened, skip
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
        categories={categories.map((cat) => ({ name: cat.name, emoji: cat.emoji }))}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      <main className="container mx-auto px-4 py-6">
        {categories.map((category) => {
          const items = groupedItems?.[category.name] || [];

          return (
            <section
              key={category.name}
              ref={(el) => setSectionRef(category.name, el)}
              data-category={category.name}
              className="mb-10"
              style={{ scrollMarginTop: "72px" }}
            >
              <h2
                className="text-xl font-extrabold text-white mb-5 uppercase tracking-wide flex items-center gap-2"
                style={{ fontWeight: 800 }}
              >
                <span className="text-2xl">{category.emoji}</span>
                {category.name}
                <span className="text-2xl">{category.emoji}</span>
              </h2>

              {items.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  {items.map((item) => (
                    <ProductCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      price={Number(item.price)}
                      oldPrice={item.old_price ? Number(item.old_price) : undefined}
                      image={item.image}
                      category={item.category}
                    />
                  ))}
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
