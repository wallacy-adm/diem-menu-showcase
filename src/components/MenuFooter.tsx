import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const MenuFooter = () => {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <footer className="mt-12 py-6 border-t border-border bg-card/50">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs text-muted-foreground">
          {settings?.footer_note ||
            "Imagens meramente ilustrativas. Produtos e preços sujeitos a alteração."}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-2">
          © {new Date().getFullYear()} {settings?.brand_name || "Carpe Diem Motel"}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};
