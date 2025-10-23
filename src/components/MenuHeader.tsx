import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InfoModal } from "./InfoModal";
import heroImage from "@/assets/carpe-diem-hero.jpg";
import logoImage from "@/assets/carpe-diem-logo.png";
import { Button } from "./ui/button";
import { Info } from "lucide-react";

export const MenuHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <header className="relative h-[420px] md:h-[520px] overflow-hidden bg-background">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background" />
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[hsl(var(--status-open))]">
            <div className="w-2 h-2 bg-[hsl(var(--status-open))] rounded-full animate-pulse" />
            <span className="text-[hsl(var(--status-open))] font-semibold text-sm">Aberto</span>
          </div>
        </div>

        {/* Info Button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/50 backdrop-blur-sm border border-muted-foreground/30 hover:bg-black/70 hover:border-muted-foreground/50 transition-all"
            aria-label="Informações"
          >
            <Info className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          {/* Logo */}
          <div className="mb-6">
            <img 
              src={logoImage} 
              alt={settings?.brand_name || "Carpe Diem Motel"} 
              className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-2xl object-cover"
            />
          </div>

          {/* Brand Name */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            {settings?.brand_name || "Carpe Diem Motel"}
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-white/90 font-bold mb-4">
            {settings?.tagline || "Aproveite o Momento!"}
          </p>

          {/* Address */}
          <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
            {settings?.address || "BR-104, Km 118, Lagoa Seca – PB"}
          </p>
        </div>
      </header>

      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        settings={settings}
      />
    </>
  );
};
