import { Shield, Wifi, WifiOff, LogOut, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import socketService from "../../services/socket";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

interface NavbarProps {
  alertCount?: number;
}

const Navbar = ({ alertCount = 0 }: NavbarProps) => {
  const { user, logout } = useAuth();
  const connected = socketService.isConnected();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emergency" />
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            SOS<span className="text-emergency">Dispatch</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {connected ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-success" />
              <span className="text-success">LIVE</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">OFFLINE</span>
            </>
          )}
        </div>

        {/* Alert count */}
        {alertCount > 0 && (
          <div className="relative">
            <Bell className="h-5 w-5 text-foreground" />
            <Badge className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] bg-emergency text-emergency-foreground border-0">
              {alertCount}
            </Badge>
          </div>
        )}

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
