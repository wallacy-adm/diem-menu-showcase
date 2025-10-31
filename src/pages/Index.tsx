import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuHeader } from "@/components/MenuHeader";
import { CategoryChips } from "@/components/CategoryChips";
import { ProductCard } from "@/components/ProductCard";
import { MenuFooter } from "@/components/MenuFooter";
import { SearchBar } from "@/components/SearchBar";
import { CartButton } from "@/components/CartButton";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

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

  const filteredItems = menuItems?.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = filteredItems?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    const element = sectionRefs.current[category];
    if (element) {
      const headerHeight = 240; // Hero header height
      const navHeight = 56; // Category bar height
      const buffer = 16; // Extra spacing
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight - buffer;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by intersectionRatio and take the most visible one
          const mostVisible = visibleEntries.sort((a, b) => 
            b.intersectionRatio - a.intersectionRatio
          )[0];
          const category = mostVisible.target.getAttribute("data-category");
          if (category) {
            setActiveCategory(category);
          }
        }
      },
      {
        rootMargin: "-140px 0px -50% 0px",
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [categories]);

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
        categories={categories.map(cat => ({ name: cat.name, emoji: cat.emoji }))}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />
      <SearchBar onSearch={setSearchQuery} />

      <main className="container mx-auto px-4 py-6">
        {searchQuery && filteredItems?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        ) : (
          categories.map((category) => {
          const items = groupedItems?.[category.name] || [];
          
          return (
            <section
              key={category.name}
              ref={(el) => (sectionRefs.current[category.name] = el)}
              data-category={category.name}
              className="mb-10"
              style={{ scrollMarginTop: "72px" }}
            >
              <h2 className="text-xl font-extrabold text-white mb-5 uppercase tracking-wide flex items-center gap-2" style={{ fontWeight: 800 }}>
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
        })
        )}
      </main>

      <MenuFooter />
      <CartButton />
    </div>
  );
};

export default Index;
