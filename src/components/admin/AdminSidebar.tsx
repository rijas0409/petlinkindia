import { LayoutDashboard, Users, Stethoscope, Package, DollarSign, Settings, Radio, PawPrint, Truck } from "lucide-react";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (s: string) => void;
  isMobile?: boolean;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "vets", label: "Vets", icon: Stethoscope },
  { id: "listings", label: "Listings", icon: PawPrint },
  { id: "products", label: "Products", icon: Package },
  { id: "transport", label: "Transport", icon: Truck },
  { id: "financials", label: "Financials", icon: DollarSign },
];

const systemItems = [
  { id: "settings", label: "Settings", icon: Settings },
];

const AdminSidebar = ({ activeSection, setActiveSection, isMobile }: AdminSidebarProps) => {
  return (
    <aside className={`${isMobile ? "relative w-full h-full" : "fixed left-0 top-0 bottom-0 w-[260px]"} bg-white border-r border-[hsl(220,20%,92%)] flex flex-col z-50`}>
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[hsl(220,80%,50%)] rounded-xl flex items-center justify-center">
          <PawPrint className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-[15px] text-[hsl(220,20%,15%)]">PetLink</h1>
          <p className="text-[11px] text-[hsl(220,15%,55%)] font-medium uppercase tracking-wider">Super Admin</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 mt-2 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${
                  isActive
                    ? "bg-[hsl(220,80%,50%)] text-white shadow-lg shadow-[hsl(220,80%,50%)]/25"
                    : "text-[hsl(220,15%,45%)] hover:bg-[hsl(220,20%,96%)]"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* System Section */}
        <div className="mt-8">
          <p className="px-4 text-[11px] font-semibold text-[hsl(220,15%,60%)] uppercase tracking-wider mb-2">System</p>
          {systemItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${
                  isActive
                    ? "bg-[hsl(220,80%,50%)] text-white shadow-lg shadow-[hsl(220,80%,50%)]/25"
                    : "text-[hsl(220,15%,45%)] hover:bg-[hsl(220,20%,96%)]"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Broadcast Button */}
      <div className="px-4 pb-6">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[hsl(220,20%,96%)] text-[hsl(220,15%,45%)] text-[14px] font-medium hover:bg-[hsl(220,20%,93%)] transition-all">
          <Radio className="w-4 h-4" />
          Broadcast
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
