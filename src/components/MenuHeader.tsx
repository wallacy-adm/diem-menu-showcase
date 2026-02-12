import { lazy, Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import fallbackHeroImage from "@/assets/carpe-diem-hero.jpg";
import fallbackLogoImage from "@/assets/carpe-diem-logo.png";
import { cn } from "@/lib/utils";

const InfoModal = lazy(() => import("./InfoModal").then((m) => ({ default: m.InfoModal })));

interface MenuHeaderProps {
  isSearchActive?: boolean;
}

export const MenuHeader = ({ isSearchActive = false }: MenuHeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const showBackground = settings?.show_bg !== false;
  const showLogo = settings?.show_logo !== false;
  const backgroundImage = showBackground ? (settings?.bg_url || fallbackHeroImage) : null;
  const logoImage = showLogo ? (settings?.logo_url || fallbackLogoImage) : null;

  return (
    <>
      <header
        className={cn(
          "relative min-h-[240px] overflow-hidden bg-black transition-opacity duration-200",
          isSearchActive ? "opacity-95" : "opacity-100"
        )}
      >
        <div className="absolute inset-0">
          {backgroundImage ? (
            <>
              <img
                src={backgroundImage}
                alt="Imagem de destaque do cardápio"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/30" />
            </>
          ) : (
            <div className="h-full w-full bg-[#0a0a0a]" />
          )}
        </div>

        <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center gap-2 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/55 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-[#2a2a2a] pointer-events-auto">
            <div className="w-2 h-2 bg-[#d6f5e6] rounded-full animate-pulse" />
            <span className="text-[#d6f5e6] text-xs">Aberto</span>
          </div>

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
            style={{ WebkitTapHighlightColor: "transparent" }}
            aria-label="Informações"
          >
            ℹ️ Informação
          </Button>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-4 py-8 pb-6 max-w-[720px] mx-auto">
          <div className="flex items-center justify-center w-[120px] h-[120px] mb-3">
            {logoImage && (
              <img
                src={logoImage}
                alt={settings?.brand_name || "Carpe Diem Motel"}
                loading="eager"
                decoding="async"
                className="w-[120px] h-[120px] rounded-xl object-cover border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
              />
            )}
          </div>

          <div className="flex flex-col items-center justify-center">
            <h1 className="text-[24px] leading-[1.1] text-white mb-0.5" style={{ fontWeight: 800 }}>
              {settings?.tagline || "Aproveite o Momento!"}
            </h1>
            <p className="text-[14px] text-[#b3b3b3]">{settings?.brand_name || "Carpe Diem Motel"}</p>
          </div>
        </div>
      </header>

      {isModalOpen && (
        <Suspense fallback={null}>
          <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} settings={settings} />
        </Suspense>
      )}
    </>
  );
};
