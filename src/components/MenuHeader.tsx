import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoModal } from "./InfoModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      <header className="sticky top-0 z-50 bg-card/98 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1.5 truncate">
                {settings?.brand_name || "Carpe Diem Motel"}
              </h1>
              <p className="text-sm text-primary font-semibold mb-1">
                {settings?.tagline || "Aproveite o Momento!"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {settings?.address || "BR-104, Km 118, Lagoa Seca – PB"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInfoOpen(true)}
              className="flex-shrink-0 border-primary/60 text-primary hover:bg-primary hover:text-black transition-smooth font-semibold rounded-xl px-4"
              aria-label="Ver informações de contato"
            >
              <Info className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Informações</span>
              <span className="sm:hidden">Info</span>
            </Button>
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
