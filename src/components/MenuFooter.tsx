import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

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

  const handleReclamacaoClick = () => {
    const whatsappUrl = settings?.whatsapp_url || "https://wa.me/";
    const message = encodeURIComponent("Olá, gostaria de registrar uma reclamação.");
    const urlWithMessage = whatsappUrl.includes("?") 
      ? `${whatsappUrl}&text=${message}` 
      : `${whatsappUrl}?text=${message}`;
    window.open(urlWithMessage, "_blank");
  };

  return (
    <footer className="mt-12 py-8 border-t border-border/30 bg-background">
      <div className="container mx-auto px-4 text-center space-y-4">
        <Button
          onClick={handleReclamacaoClick}
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Reclamações
        </Button>
        <p className="text-xs text-[#b3b3b3]">
          Imagens meramente ilustrativas. Produtos e preços sujeitos a alteração sem aviso prévio.
        </p>
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} {settings?.brand_name || "Carpe Diem Motel"}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};
