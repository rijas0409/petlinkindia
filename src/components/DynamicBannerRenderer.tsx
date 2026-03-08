import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DynBanner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  gradient: string;
  cta_text: string;
  link_url: string;
  target_route: string;
  banner_style: string;
  custom_width: string;
  custom_height: string;
  placement: string;
  border_radius: string;
  position: number;
}

// Excluded routes where banners should never show
const EXCLUDED_ROUTES = ["/admin", "/auth", "/auth-buyer", "/auth-breeder", "/auth-delivery", "/auth-admin", "/auth-products", "/auth-vet", "/"];

const GlobalBannerInjector = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [topBanners, setTopBanners] = useState<DynBanner[]>([]);
  const [bottomBanners, setBottomBanners] = useState<DynBanner[]>([]);
  const currentPath = location.pathname;

  // Don't show on excluded routes
  const isExcluded = EXCLUDED_ROUTES.some(r => currentPath === r || currentPath.startsWith("/auth"));

  useEffect(() => {
    if (isExcluded) {
      setTopBanners([]);
      setBottomBanners([]);
      return;
    }

    const fetchBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .neq("banner_style", "carousel")
        .order("position");

      if (!data) { setTopBanners([]); setBottomBanners([]); return; }

      const matched = (data as DynBanner[]).filter(b => {
        const route = b.target_route;
        if (route === "*") return true;
        if (currentPath === route) return true;
        if (route.endsWith("*") && currentPath.startsWith(route.slice(0, -1))) return true;
        return false;
      });

      setTopBanners(matched.filter(b => b.placement === "top"));
      setBottomBanners(matched.filter(b => b.placement === "bottom"));
    };
    fetchBanners();
  }, [currentPath, isExcluded]);

  const renderBanner = (b: DynBanner) => {
    const handleClick = () => {
      if (!b.link_url) return;
      if (b.link_url.startsWith("http")) window.open(b.link_url, "_blank");
      else navigate(b.link_url);
    };

    return (
      <div
        key={b.id}
        onClick={b.link_url ? handleClick : undefined}
        className={`overflow-hidden mx-auto ${b.link_url ? "cursor-pointer active:scale-[0.98] transition-transform" : ""}`}
        style={{
          width: b.custom_width || "100%",
          maxWidth: "100%",
          height: b.custom_height || "auto",
          borderRadius: b.border_radius || "16px",
          background: b.gradient,
        }}
      >
        <div className="flex items-center h-full relative">
          {b.image_url && (
            <img src={b.image_url} alt={b.title} className="absolute inset-0 w-full h-full object-cover"
              style={{ borderRadius: b.border_radius || "16px" }} />
          )}
          {b.image_url && (
            <div className="absolute inset-0" style={{
              background: `${b.gradient.split(')')[0]}, 0.5)`,
              borderRadius: b.border_radius || "16px",
            }} />
          )}
          <div className="relative z-10 flex items-center w-full h-full p-4">
            <div className="flex-1 min-w-0">
              {b.title && <h3 className="text-white text-sm md:text-base font-bold leading-tight whitespace-pre-line">{b.title}</h3>}
              {b.subtitle && <p className="text-white/80 text-[11px] mt-0.5 whitespace-pre-line">{b.subtitle}</p>}
              {b.cta_text && <button className="mt-1.5 bg-white text-black text-[11px] font-semibold px-3 py-1 rounded-full">{b.cta_text}</button>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (topBanners.length === 0 && bottomBanners.length === 0) return null;

  return (
    <>
      {topBanners.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
          <div className="pointer-events-auto px-4 pt-2 space-y-2" style={{ paddingTop: "env(safe-area-inset-top, 8px)" }}>
            {/* We use a portal approach - render nothing fixed, instead use inline */}
          </div>
        </div>
      )}
    </>
  );
};

// Inline component to be placed inside page content
export const InlineBanners = ({ placement = "top" }: { placement?: "top" | "bottom" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<DynBanner[]>([]);
  const currentPath = location.pathname;

  const isExcluded = EXCLUDED_ROUTES.some(r => currentPath === r || currentPath.startsWith("/auth"));

  useEffect(() => {
    if (isExcluded) { setBanners([]); return; }

    const fetchBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .eq("placement", placement)
        .neq("banner_style", "carousel")
        .order("position");

      if (!data) { setBanners([]); return; }

      const matched = (data as DynBanner[]).filter(b => {
        const route = b.target_route;
        if (route === "*") return true;
        if (currentPath === route) return true;
        if (route.endsWith("*") && currentPath.startsWith(route.slice(0, -1))) return true;
        return false;
      });
      setBanners(matched);
    };
    fetchBanners();
  }, [currentPath, placement, isExcluded]);

  if (banners.length === 0) return null;

  return (
    <div className="px-4 py-2 space-y-2">
      {banners.map(b => (
        <div
          key={b.id}
          onClick={() => {
            if (!b.link_url) return;
            b.link_url.startsWith("http") ? window.open(b.link_url, "_blank") : navigate(b.link_url);
          }}
          className={`overflow-hidden mx-auto ${b.link_url ? "cursor-pointer active:scale-[0.98] transition-transform" : ""}`}
          style={{
            width: b.custom_width || "100%",
            maxWidth: "100%",
            height: b.custom_height || "auto",
            borderRadius: b.border_radius || "16px",
            background: b.gradient,
          }}
        >
          <div className="flex items-center h-full relative">
            {b.image_url && <img src={b.image_url} alt={b.title} className="absolute inset-0 w-full h-full object-cover" style={{ borderRadius: b.border_radius || "16px" }} />}
            {b.image_url && <div className="absolute inset-0" style={{ background: `${b.gradient.split(')')[0]}, 0.5)`, borderRadius: b.border_radius || "16px" }} />}
            <div className="relative z-10 flex items-center w-full h-full p-4">
              <div className="flex-1 min-w-0">
                {b.title && <h3 className="text-white text-sm md:text-base font-bold leading-tight whitespace-pre-line">{b.title}</h3>}
                {b.subtitle && <p className="text-white/80 text-[11px] mt-0.5 whitespace-pre-line">{b.subtitle}</p>}
                {b.cta_text && <button className="mt-1.5 bg-white text-black text-[11px] font-semibold px-3 py-1 rounded-full">{b.cta_text}</button>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalBannerInjector;
