import { Search, Bell, LayoutGrid, LogOut, Menu } from "lucide-react";
import { useState } from "react";

interface AdminTopBarProps {
  user: any;
  onLogout: () => void;
  onMenuToggle?: () => void;
}

const AdminTopBar = ({ user, onLogout, onMenuToggle }: AdminTopBarProps) => {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-[hsl(220,20%,92%)]">
      <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="w-10 h-10 rounded-xl bg-[hsl(220,20%,97%)] flex items-center justify-center hover:bg-[hsl(220,20%,94%)] transition-colors">
            <Menu className="w-5 h-5 text-[hsl(220,15%,45%)]" />
          </button>
          <div className={`relative ${isMobile ? "w-[180px]" : "w-[340px]"}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,15%,60%)]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[hsl(220,20%,97%)] border border-[hsl(220,20%,92%)] rounded-xl text-sm text-[hsl(220,20%,20%)] placeholder:text-[hsl(220,15%,60%)] focus:outline-none focus:ring-2 focus:ring-[hsl(220,80%,50%)]/20 focus:border-[hsl(220,80%,50%)]"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4">
          <button className="w-10 h-10 rounded-xl bg-[hsl(220,20%,97%)] flex items-center justify-center hover:bg-[hsl(220,20%,94%)] transition-colors relative">
            <Bell className="w-[18px] h-[18px] text-[hsl(220,15%,45%)]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[hsl(0,75%,55%)] rounded-full"></span>
          </button>
          {!isMobile && (
            <button className="w-10 h-10 rounded-xl bg-[hsl(220,20%,97%)] flex items-center justify-center hover:bg-[hsl(220,20%,94%)] transition-colors">
              <LayoutGrid className="w-[18px] h-[18px] text-[hsl(220,15%,45%)]" />
            </button>
          )}
          {!isMobile && <div className="h-8 w-px bg-[hsl(220,20%,90%)]" />}
          <div className="flex items-center gap-2 md:gap-3">
            {!isMobile && (
              <div className="text-right">
                <p className="text-sm font-semibold text-[hsl(220,20%,15%)]">{user?.user_metadata?.name || "Admin"}</p>
                <p className="text-[11px] text-[hsl(220,15%,55%)]">System Administrator</p>
              </div>
            )}
            <button onClick={onLogout} className="w-10 h-10 rounded-full bg-[hsl(220,20%,94%)] flex items-center justify-center text-[hsl(220,15%,45%)] hover:bg-[hsl(220,20%,90%)] transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
