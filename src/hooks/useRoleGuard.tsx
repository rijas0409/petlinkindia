import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type AllowedRole = "buyer" | "seller" | "admin" | "delivery_partner" | "product_seller";

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate(redirectPath || "/auth");
        return;
      }

      // Get role from user_roles table (authoritative source)
      const { data: roleData } = await supabase.rpc("get_user_role", { _user_id: session.user.id });

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
          default:
            navigate("/auth");
        }
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setUser(session.user);
      setProfile(profileData);
      setIsLoading(false);
    };

    checkAccess();
  }, [navigate, allowedRoles, redirectPath]);

  return { isLoading, user, profile };
};
