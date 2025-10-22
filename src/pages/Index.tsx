import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuHeader } from "@/components/MenuHeader";
import { CategoryChips } from "@/components/CategoryChips";
import { ProductCard } from "@/components/ProductCard";
import { MenuFooter } from "@/components/MenuFooter";
import { Loader2 } from "lucide-react";

const INITIAL_CATEGORIES = [
  "Promoção em Dobro",
  "Promoção do Dia",
  "Campeões de Vendas",
  "Indicação do Chef",
  "Espumantes",
  "Vinhos Nacionais",
  "Vinhos Importados",
  "Petiscos",
  "Carnes",
  "Frangos",
  "Peixes",
  "Massas",
  "Porções Extras",
  "Sanduíches",
  "Sobremesas",
  "Bebidas",
  "Licores",
  "Sucos",
  "Whisky",
  "Bomboniere",
  "Perfumaria",
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const groupedItems = menuItems?.reduce((acc, item) => {
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
      const headerOffset = 180; // Header + CategoryChips height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.getAttribute("data-category") || "");
          }
        });
      },
      {
        rootMargin: "-200px 0px -50% 0px",
        threshold: 0,
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [groupedItems]);

  if (isLoading) {
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
        categories={INITIAL_CATEGORIES}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      <main className="container mx-auto px-4 py-6">
        {INITIAL_CATEGORIES.map((category) => {
          const items = groupedItems?.[category] || [];
          return (
            <section
              key={category}
              ref={(el) => (sectionRefs.current[category] = el)}
              data-category={category}
              className="mb-8 scroll-mt-48"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
                {category}
              </h2>

              {items.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum item disponível nesta categoria no momento.
                </p>
              ) : (
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
