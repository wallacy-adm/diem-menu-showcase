import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InfoModal } from "./InfoModal";
import { Button } from "./ui/button";
import fallbackHeroImage from "@/assets/carpe-diem-hero.jpg";
import fallbackLogoImage from "@/assets/carpe-diem-logo.png";
import { useSessionCache } from "@/hooks/useSessionCache";

export const MenuHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cache settings for instant rendering
  const settingsCache = useSessionCache<any>("settings");
  const cachedSettings = useMemo(() => settingsCache.getCache(), []);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").single();

      if (error) throw error;

      // Update cache on successful fetch
      if (data) {
        settingsCache.setCache(data);
      }
      return data;
    },
    initialData: cachedSettings || undefined,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: !cachedSettings,
  });

  // Respect show_logo and show_bg toggles (visibility only — never unmount)
  const showBackground = settings?.show_bg !== false;
  const showLogo = settings?.show_logo !== false;

  // IMPORTANT: hero assets are always rendered in the DOM.
  // If a remote URL fails (e.g., transient error), fall back to local assets instead of hiding permanently.
  const desiredBgSrc = settings?.bg_url || fallbackHeroImage;
  const desiredLogoSrc = settings?.logo_url || fallbackLogoImage;

  const [bgSrc, setBgSrc] = useState<string>(desiredBgSrc);
  const [logoSrc, setLogoSrc] = useState<string>(desiredLogoSrc);

  useEffect(() => {
    setBgSrc(desiredBgSrc);
  }, [desiredBgSrc]);

  useEffect(() => {
    setLogoSrc(desiredLogoSrc);
  }, [desiredLogoSrc]);

  return (
    <>
      {/* HERO SECTION - ALWAYS MOUNTED, NEVER CONDITIONAL */}
      <header className="relative min-h-[240px] overflow-hidden bg-black">
        {/* Background solid fallback - always visible */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />

        {/* Hero background image - ALWAYS mounted */}
        <img
          src={bgSrc}
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1 }}
          onError={() => {
            // Fall back to local asset; never hide/unmount
            setBgSrc(fallbackHeroImage);
          }}
        />

        {/* Gradient overlay - always visible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            background: "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.3))",
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
            style={{ WebkitTapHighlightColor: "transparent" }}
            aria-label="Informações"
          >
            ℹ️ Informação
          </Button>
        </div>

        {/* Content Container - Fixed structure layout */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 py-8 pb-6 max-w-[720px] mx-auto">
          {/* Logo Space Holder - Always reserves 120px + 12px margin, never collapses */}
          <div className="flex items-center justify-center w-[120px] h-[120px] mb-3">
            {/* Logo image - ALWAYS mounted */}
            <img
              src={logoSrc}
              alt={settings?.brand_name || "Carpe Diem Motel"}
              className="w-[120px] h-[120px] rounded-xl object-cover border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
              style={{ opacity: showLogo ? 1 : 0 }}
              loading="eager"
              decoding="async"
              onError={() => {
                // Fall back to local asset; never hide/unmount
                setLogoSrc(fallbackLogoImage);
              }}
            />
          </div>

          {/* Slogan Block - Fixed position, never moves */}
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-[24px] leading-[1.1] text-white mb-0.5" style={{ fontWeight: 800 }}>
              {settings?.tagline || "Aproveite o Momento!"}
            </h1>
            <p className="text-[14px] text-[#b3b3b3]">{settings?.brand_name || "Carpe Diem Motel"}</p>
          </div>
        </div>
      </header>

      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} settings={settings} />
    </>
  );
};

