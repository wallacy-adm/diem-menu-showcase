import { useEffect, useState, memo, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import fallbackHeroImage from "@/assets/carpe-diem-hero.jpg";
import fallbackLogoImage from "@/assets/carpe-diem-logo.png";

const InfoModal = lazy(() => import("./InfoModal").then((module) => ({ default: module.InfoModal })));

export const MenuHeader = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").single();

      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
  });

  const showBackground = settings?.show_bg !== false;
  const showLogo = settings?.show_logo !== false;
  const backgroundImage = showBackground ? (settings?.bg_url || fallbackHeroImage) : null;
  const logoImage = showLogo ? (settings?.logo_url || fallbackLogoImage) : null;

  useEffect(() => {
    if (!backgroundImage) return;

    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "image";
    preload.href = backgroundImage;
    document.head.appendChild(preload);

    return () => {
      document.head.removeChild(preload);
    };
  }, [backgroundImage]);

  return (
    <>
      <header className="relative min-h-[240px] overflow-hidden bg-black">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            width={1280}
            height={720}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/35" />

        <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center gap-2 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/55 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-[#2a2a2a] pointer-events-auto">
            <div className="w-2 h-2 bg-[#d6f5e6] rounded-full animate-pulse" />
            <span className="text-[#d6f5e6] text-xs">Aberto</span>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
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
                className="w-[120px] h-[120px] rounded-xl object-cover border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                loading="eager"
                decoding="async"
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

      {isModalOpen ? (
        <Suspense fallback={null}>
          <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} settings={settings} />
        </Suspense>
      ) : null}
    </>
  );
});

MenuHeader.displayName = "MenuHeader";
