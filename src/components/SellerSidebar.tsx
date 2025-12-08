import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Heart, Package, ShoppingBag, MessageCircle, Truck, 
  DollarSign, User, LogOut, Plus, LayoutDashboard, 
  Megaphone, Settings, HelpCircle, ChevronLeft, ChevronRight,
  Menu
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SellerSidebarProps {
  onOpenPromotion?: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/seller-dashboard" },
  { icon: Package, label: "My Listings", path: "/seller-dashboard?tab=listings" },
  { icon: Plus, label: "Add New Pet", path: "/add-pet" },
  { icon: ShoppingBag, label: "Orders", path: "/seller-dashboard?tab=orders" },
  { icon: MessageCircle, label: "Messages", path: "/seller-dashboard?tab=chats" },
  { icon: Truck, label: "Transport", path: "/seller-dashboard?tab=transport" },
  { icon: DollarSign, label: "Earnings", path: "/seller-dashboard?tab=earnings" },
  { icon: Megaphone, label: "Promotions", action: "promotion" },
  { icon: User, label: "Profile", path: "/seller-profile" },
  { icon: Settings, label: "Settings", path: "/seller-settings" },
  { icon: HelpCircle, label: "Help & Support", path: "/help" },
];

const SellerSidebar = ({ onOpenPromotion }: SellerSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (item.action === "promotion" && onOpenPromotion) {
      onOpenPromotion();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-card rounded-xl shadow-card flex items-center justify-center"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border shadow-card z-40 transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          "hidden md:flex flex-col"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-4 border-b border-border flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                  PetLink
                </span>
                <p className="text-xs text-muted-foreground">Seller Panel</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = item.path && location.pathname === item.path.split("?")[0];
            return (
              <button
                key={item.label}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                {!isCollapsed && (
                  <span className={cn("text-sm", isActive && "font-medium")}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border shadow-card z-40 transition-transform duration-300 w-64 md:hidden flex flex-col",
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Same content as desktop */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                PetLink
              </span>
              <p className="text-xs text-muted-foreground">Seller Panel</p>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = item.path && location.pathname === item.path.split("?")[0];
            return (
              <button
                key={item.label}
                onClick={() => {
                  handleItemClick(item);
                  setIsCollapsed(true);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                <span className={cn("text-sm", isActive && "font-medium")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SellerSidebar;
