import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoModal } from "./InfoModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/carpe-diem-hero.jpg";

export const MenuHeader = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

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
    <>
      <header className="sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="relative h-[200px] md:h-[240px] overflow-hidden">
          <img 
            src={heroImage} 
            alt="Fachada Carpe Diem Motel"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/95" />
          
          <div className="relative container mx-auto px-4 py-5 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 truncate drop-shadow-lg">
                  {settings?.brand_name || "Carpe Diem Motel"}
                </h1>
                <p className="text-sm md:text-base text-primary font-semibold mb-1.5 drop-shadow-md">
                  {settings?.tagline || "Aproveite o Momento!"}
                </p>
                <p className="text-xs md:text-sm text-foreground/90 truncate drop-shadow-md">
                  {settings?.address || "BR-104, Km 118, Lagoa Seca – PB"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInfoOpen(true)}
                className="flex-shrink-0 border-primary/60 text-primary hover:bg-primary hover:text-black transition-smooth font-semibold rounded-xl px-4 backdrop-blur-sm bg-card/80"
                aria-label="Ver informações de contato"
              >
                <Info className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Informações</span>
                <span className="sm:hidden">Info</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        settings={settings}
      />
    </>
  );
};
