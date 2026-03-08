import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DynamicBanner {
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
  is_active: boolean;
}

const DynamicBannerRenderer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<DynamicBanner[]>([]);
  const currentPath = location.pathname;

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .neq("banner_style", "carousel")
        .order("position");

      if (data) {
        // Match banners to current route - support exact and prefix match
        const matched = (data as DynamicBanner[]).filter(b => {
          const route = b.target_route;
          if (route === "*") return true; // show on all pages
          if (currentPath === route) return true;
          if (route.endsWith("*") && currentPath.startsWith(route.slice(0, -1))) return true;
          return false;
        });
        setBanners(matched);
      }
    };
    fetchBanners();
  }, [currentPath]);

  if (banners.length === 0) return null;

  const topBanners = banners.filter(b => b.placement === "top");
  const bottomBanners = banners.filter(b => b.placement === "bottom");

  const renderBanner = (b: DynamicBanner) => {
    const handleClick = () => {
      if (b.link_url) {
        if (b.link_url.startsWith("http")) {
          window.open(b.link_url, "_blank");
        } else {
          navigate(b.link_url);
        }
      }
    };

    return (
      <div
        key={b.id}
        onClick={b.link_url ? handleClick : undefined}
        className={`overflow-hidden mx-auto ${b.link_url ? "cursor-pointer" : ""}`}
        style={{
          width: b.custom_width || "100%",
          height: b.custom_height || "auto",
          borderRadius: b.border_radius || "16px",
          background: b.gradient,
          marginBottom: "8px",
        }}
      >
        <div className="flex items-center h-full relative">
          {b.image_url && (
            <img
              src={b.image_url}
              alt={b.title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ borderRadius: b.border_radius || "16px" }}
            />
          )}
          <div className="absolute inset-0" style={{ background: b.image_url ? b.gradient.replace(")", ", 0.6)").replace("linear-gradient", "linear-gradient") : "transparent" }} />
          <div className="relative z-10 flex items-center w-full h-full p-4">
            <div className="flex-1">
              {b.title && <h3 className="text-white text-base md:text-lg font-bold leading-tight whitespace-pre-line">{b.title}</h3>}
              {b.subtitle && <p className="text-white/80 text-xs mt-1 whitespace-pre-line">{b.subtitle}</p>}
              {b.cta_text && (
                <button className="mt-2 bg-white text-black text-xs font-semibold px-4 py-1.5 rounded-full">
                  {b.cta_text}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Top placement banners */}
      {topBanners.length > 0 && (
        <div className="px-4 pt-2">
          {topBanners.map(renderBanner)}
        </div>
      )}

      {/* Bottom placement banners rendered via portal-like fixed position */}
      {bottomBanners.length > 0 && (
        <div className="px-4 pb-2">
          {bottomBanners.map(renderBanner)}
        </div>
      )}
    </>
  );
};

// Separate components for top/bottom injection in pages
export const TopBanners = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<DynamicBanner[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .eq("placement", "top")
        .neq("banner_style", "carousel")
        .order("position");

      if (data) {
        const matched = (data as DynamicBanner[]).filter(b => {
          const route = b.target_route;
          if (route === "*") return true;
          if (location.pathname === route) return true;
          if (route.endsWith("*") && location.pathname.startsWith(route.slice(0, -1))) return true;
          return false;
        });
        setBanners(matched);
      }
    };
    fetchBanners();
  }, [location.pathname]);

  if (banners.length === 0) return null;

  return (
    <div className="px-4 pt-2 space-y-2">
      {banners.map(b => (
        <div
          key={b.id}
          onClick={() => {
            if (b.link_url) {
              b.link_url.startsWith("http") ? window.open(b.link_url, "_blank") : navigate(b.link_url);
            }
          }}
          className={`overflow-hidden mx-auto ${b.link_url ? "cursor-pointer" : ""}`}
          style={{
            width: b.custom_width || "100%",
            height: b.custom_height || "auto",
            borderRadius: b.border_radius || "16px",
            background: b.gradient,
          }}
        >
          <div className="flex items-center h-full relative">
            {b.image_url && <img src={b.image_url} alt={b.title} className="absolute inset-0 w-full h-full object-cover" style={{ borderRadius: b.border_radius || "16px" }} />}
            {b.image_url && <div className="absolute inset-0" style={{ background: `${b.gradient.split(')')[0]}, 0.5)`, borderRadius: b.border_radius || "16px" }} />}
            <div className="relative z-10 flex items-center w-full h-full p-4">
              <div className="flex-1">
                {b.title && <h3 className="text-white text-base font-bold leading-tight whitespace-pre-line">{b.title}</h3>}
                {b.subtitle && <p className="text-white/80 text-xs mt-1 whitespace-pre-line">{b.subtitle}</p>}
                {b.cta_text && <button className="mt-2 bg-white text-black text-xs font-semibold px-3 py-1 rounded-full">{b.cta_text}</button>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const BottomBanners = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<DynamicBanner[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .eq("placement", "bottom")
        .neq("banner_style", "carousel")
        .order("position");

      if (data) {
        const matched = (data as DynamicBanner[]).filter(b => {
          const route = b.target_route;
          if (route === "*") return true;
          if (location.pathname === route) return true;
          if (route.endsWith("*") && location.pathname.startsWith(route.slice(0, -1))) return true;
          return false;
        });
        setBanners(matched);
      }
    };
    fetchBanners();
  }, [location.pathname]);

  if (banners.length === 0) return null;

  return (
    <div className="px-4 pb-2 space-y-2">
      {banners.map(b => (
        <div
          key={b.id}
          onClick={() => {
            if (b.link_url) {
              b.link_url.startsWith("http") ? window.open(b.link_url, "_blank") : navigate(b.link_url);
            }
          }}
          className={`overflow-hidden mx-auto ${b.link_url ? "cursor-pointer" : ""}`}
          style={{
            width: b.custom_width || "100%",
            height: b.custom_height || "auto",
            borderRadius: b.border_radius || "16px",
            background: b.gradient,
          }}
        >
          <div className="flex items-center h-full relative">
            {b.image_url && <img src={b.image_url} alt={b.title} className="absolute inset-0 w-full h-full object-cover" style={{ borderRadius: b.border_radius || "16px" }} />}
            {b.image_url && <div className="absolute inset-0" style={{ background: `${b.gradient.split(')')[0]}, 0.5)`, borderRadius: b.border_radius || "16px" }} />}
            <div className="relative z-10 flex items-center w-full h-full p-4">
              <div className="flex-1">
                {b.title && <h3 className="text-white text-base font-bold leading-tight whitespace-pre-line">{b.title}</h3>}
                {b.subtitle && <p className="text-white/80 text-xs mt-1 whitespace-pre-line">{b.subtitle}</p>}
                {b.cta_text && <button className="mt-2 bg-white text-black text-xs font-semibold px-3 py-1 rounded-full">{b.cta_text}</button>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DynamicBannerRenderer;
