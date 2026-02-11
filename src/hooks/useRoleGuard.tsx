import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type AllowedRole = "buyer" | "seller" | "admin" | "delivery_partner" | "product_seller" | "vet";

interface RoleGuardResult {
  isLoading: boolean;
  user: any;
  profile: any;
}

export const useRoleGuard = (allowedRoles: AllowedRole[], redirectPath?: string): RoleGuardResult => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setIsLoading(false);
          navigate(redirectPath || "/auth");
          return;
        }

        // Get role from user_roles table (authoritative source)
        let { data: roleData } = await supabase.rpc("get_user_role", { _user_id: session.user.id });

        // Fallback: in some edge cases the RPC may return null (e.g. missing row). Try direct read.
        if (!roleData) {
          const roleRes = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle();
          roleData = (roleRes.data as any)?.role ?? null;
        }

        if (!roleData || !allowedRoles.includes(roleData as AllowedRole)) {
          // Redirect to appropriate dashboard
          switch (roleData) {
            case "buyer":
              navigate("/buyer-dashboard");
              break;
            case "seller":
              navigate("/seller-dashboard");
              break;
            case "admin":
              navigate("/admin");
              break;
            case "delivery_partner":
              navigate("/delivery");
              break;
            case "product_seller":
              navigate("/products-dashboard");
              break;
            case "vet":
              navigate("/vet-dashboard");
              break;
            default:
              navigate(redirectPath || "/auth");
          }
          setIsLoading(false);
          return;
        }

        // NOTE: .single() throws when 0 rows, which can cause dashboards to get stuck.
        // Use maybeSingle() and auto-create the missing profile row if needed.
        const profileRes = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        let profileData = profileRes.data;

        if (!profileData) {
          const fallbackName =
            (session.user.user_metadata as any)?.name ||
            (session.user.user_metadata as any)?.full_name ||
            "User";

          // Upsert a minimal profile row so RLS + app queries work reliably
          await supabase
            .from("profiles")
            .upsert(
              {
                id: session.user.id,
                name: fallbackName,
                email: session.user.email,
                role: roleData as any,
              } as any,
              { onConflict: "id" }
            );

          const retry = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          profileData = retry.data;
        }

        setUser(session.user);
        setProfile(profileData);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [navigate, allowedRoles, redirectPath]);

  return { isLoading, user, profile };
};
