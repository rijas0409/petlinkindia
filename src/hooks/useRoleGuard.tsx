import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type AllowedRole = "buyer" | "seller" | "admin" | "delivery_partner" | "product_seller" | "vet";

interface RoleGuardResult {
  isLoading: boolean;
  user: any;
  profile: any;
  error: string | null;
}

export const useRoleGuard = (allowedRoles: AllowedRole[], redirectPath?: string): RoleGuardResult => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) { setIsLoading(false); navigate(redirectPath || "/auth"); }
          return;
        }

        const meta = session.user.user_metadata as any;
        const expectedRole = meta?.role as AllowedRole | undefined;
        const userName = meta?.name || meta?.full_name || "User";

        // Self-heal: ensure user_roles + profiles rows exist
        if (expectedRole) {
          await supabase.rpc("ensure_user_initialized" as any, {
            _role: expectedRole,
            _name: userName,
            _email: session.user.email || "",
          });
        }

        // Get role
        let { data: roleData } = await supabase.rpc("get_user_role", { _user_id: session.user.id });

        if (!roleData) {
          // Last-resort direct read
          const roleRes = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle();
          roleData = (roleRes.data as any)?.role ?? null;
        }

        if (cancelled) return;

        if (!roleData || !allowedRoles.includes(roleData as AllowedRole)) {
          switch (roleData) {
            case "buyer": navigate("/buyer-dashboard"); break;
            case "seller": navigate("/seller-dashboard"); break;
            case "admin": navigate("/admin"); break;
            case "delivery_partner": navigate("/delivery"); break;
            case "product_seller": navigate("/products-dashboard"); break;
            case "vet": navigate("/vet-dashboard"); break;
            default: navigate(redirectPath || "/auth");
          }
          setIsLoading(false);
          return;
        }

        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (cancelled) return;

        setUser(session.user);
        setProfile(profileData || {
          id: session.user.id,
          name: userName,
          email: session.user.email,
          role: roleData,
          is_onboarding_complete: false,
          is_admin_approved: false,
        });
      } catch (err: any) {
        console.error("useRoleGuard error:", err);
        if (!cancelled) setError(err?.message || "Authentication check failed");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkAccess();
    return () => { cancelled = true; };
  }, [navigate, allowedRoles, redirectPath]);

  return { isLoading, user, profile, error };
};
