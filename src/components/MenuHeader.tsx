import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InfoModal } from "./InfoModal";
import { Button } from "./ui/button";
import fallbackHeroImage from "@/assets/carpe-diem-hero.jpg";
import fallbackLogoImage from "@/assets/carpe-diem-logo.png";

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

  // Use dynamic images from settings, fallback to local assets
  // Respect show_logo and show_bg toggles
  const showBackground = settings?.show_bg !== false;
  const showLogo = settings?.show_logo !== false;
  const backgroundImage = showBackground ? (settings?.bg_url || fallbackHeroImage) : null;
  const logoImage = showLogo ? (settings?.logo_url || fallbackLogoImage) : null;

  return (
    <>
      <header className="relative min-h-[240px] overflow-hidden bg-black">
        {/* Hero Background Image with Gradient Overlay - Always maintain structure */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: backgroundImage 
              ? `linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.3)), url(${backgroundImage})`
              : undefined,
            backgroundColor: backgroundImage ? undefined : '#0a0a0a'
          }}
        />

        {/* Top Bar with Status and Info */}
        <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center gap-2 pointer-events-none">
          {/* Status Badge */}
          <div className="flex items-center gap-2 bg-black/55 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-[#2a2a2a] pointer-events-auto">
            <div className="w-2 h-2 bg-[#d6f5e6] rounded-full animate-pulse" />
            <span className="text-[#d6f5e6] text-xs">Aberto</span>
          </div>

          {/* Info Button */}
          <Button
            onClick={() => setIsModalOpen(true)}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            size="sm"
            className="bg-black/55 backdrop-blur-sm border border-[#2a2a2a] hover:bg-black/70 active:bg-black/80 rounded-[10px] px-2.5 py-1.5 h-auto text-xs text-white touch-manipulation pointer-events-auto cursor-pointer select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Informações"
          >
            ℹ️ Informação
          </Button>
        </div>

        {/* Content Container - Flex column with fixed structure */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-8 pb-6 max-w-[720px] mx-auto min-h-[180px]">
          {/* Logo Block - Independent container with fixed height when logo is hidden */}
          <div className={`flex items-center justify-center ${logoImage ? 'mb-3' : 'h-0'}`}>
            {logoImage && (
              <img 
                src={logoImage} 
                alt={settings?.brand_name || "Carpe Diem Motel"} 
                className="w-[120px] h-[120px] rounded-xl object-cover border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.35)] block"
              />
            )}
          </div>

          {/* Slogan Block - Independent container, always centered */}
          <div className="flex flex-col items-center justify-center">
            {/* Title */}
            <h1 className="text-[24px] leading-[1.1] text-white mb-0.5" style={{ fontWeight: 800 }}>
              {settings?.tagline || "Aproveite o Momento!"}
            </h1>

            {/* Subtitle */}
            <p className="text-[14px] text-[#b3b3b3]">
              {settings?.brand_name || "Carpe Diem Motel"}
            </p>
          </div>
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
