import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Settings, Calendar, Wallet, LogOut } from "lucide-react";
import { toast } from "sonner";

interface HeaderProfileDropdownProps {
  trigger?: React.ReactNode;
}

const HeaderProfileDropdown = ({ trigger }: HeaderProfileDropdownProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; photo: string | null } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Immediately try to get cached session for initial render
    const initUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Use metadata immediately to avoid "U" flash
        const metaName = (session.user.user_metadata as any)?.name || "";
        setUser({
          name: metaName || "User",
          email: session.user.email || "",
          photo: null,
        });
        // Then fetch full profile in background
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, email, profile_photo")
          .eq("id", session.user.id)
          .maybeSingle();
        if (profile) {
          setUser({
            name: profile.name || metaName || "User",
            email: profile.email || session.user.email || "",
            photo: profile.profile_photo,
          });
        }
      }
    };
    initUser();

    // Listen for auth state changes to keep in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const metaName = (session.user.user_metadata as any)?.name || "";
        setUser(prev => ({
          name: prev?.name || metaName || "User",
          email: session.user.email || "",
          photo: prev?.photo || null,
        }));
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, email, profile_photo")
          .eq("id", session.user.id)
          .maybeSingle();
        if (profile) {
          setUser({
            name: profile.name || metaName || "User",
            email: profile.email || session.user.email || "",
            photo: profile.profile_photo,
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const getInitial = () => {
    return user?.name?.[0]?.toUpperCase() || "U";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full w-9 h-9 p-0 overflow-hidden"
          >
            {user?.photo ? (
              <img 
                src={user.photo} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                {getInitial()}
              </div>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-0 rounded-2xl shadow-lg border-0 bg-card" 
        align="end"
        sideOffset={8}
      >
        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              {user?.photo ? (
                <img 
                  src={user.photo} 
                  alt={user?.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                  {getInitial()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <button
            onClick={() => { setOpen(false); navigate("/profile-menu"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Profile Settings</span>
          </button>
          <button
            onClick={() => { setOpen(false); toast.info("Bookings coming soon"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
          >
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">My Bookings</span>
          </button>
          <button
            onClick={() => { setOpen(false); navigate("/profile/wallet"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
          >
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Wallet</span>
          </button>
        </div>

        {/* Sign Out */}
        <div className="p-2 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-destructive/10 transition-colors text-left text-destructive"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HeaderProfileDropdown;
