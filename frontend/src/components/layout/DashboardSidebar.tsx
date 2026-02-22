import { MapPin, List, BarChart3, Settings, Radio } from "lucide-react";
import { cn } from "../../lib/utils"

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "feed", label: "SOS Feed", icon: List },
  { id: "map", label: "Live Map", icon: MapPin },
  { id: "stats", label: "Statistics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const DashboardSidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <aside className="w-16 lg:w-56 border-r border-border bg-card flex flex-col shrink-0">
      {/* Live indicator */}
      <div className="p-3 lg:p-4 border-b border-border">
        <div className="flex items-center gap-2 justify-center lg:justify-start">
          <Radio className="h-4 w-4 text-emergency animate-pulse-emergency" />
          <span className="hidden lg:block text-xs font-mono font-semibold tracking-wider text-emergency uppercase">
            Live Monitor
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 lg:px-4 py-3 text-sm transition-colors",
                "hover:bg-secondary",
                isActive
                  ? "bg-secondary text-foreground border-r-2 border-emergency"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 mx-auto lg:mx-0", isActive && "text-emergency")} />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 lg:p-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center lg:text-left font-mono">
          v1.0.0
        </p>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
