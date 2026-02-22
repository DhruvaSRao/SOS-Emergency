import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchSOSAlerts } from "../services/api";
import socketService from "../services/socket";
import { SOSAlert } from "../types/sos";
import Navbar from "../components/layout/Navbar";
import DashboardSidebar from "../components/layout/DashboardSidebar";
import SOSList from "../components/sos/SOSList";
import LiveMap from "../components/map/LiveMap";
import { Loader2, MapPin, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const PoliceDashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [activeTab, setActiveTab] = useState("feed");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await fetchSOSAlerts();
        const data = res.data.data as SOSAlert[];
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAlerts(sorted);
      } catch (err) {
        console.error("Failed to fetch SOS alerts:", err);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) loadAlerts();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    socketService.connect();

    const handleNewSOS = (data: SOSAlert) => {
      setAlerts((prev) => [data, ...prev]);
    };

    const handleStatusUpdate = (data: { _id: string; status: string }) => {
      setAlerts((prev) =>
        prev.map((a) =>
          a._id === data._id ? { ...a, status: data.status as SOSAlert["status"] } : a
        )
      );
    };

    socketService.onNewSOS(handleNewSOS);
    socketService.onSOSStatusUpdate(handleStatusUpdate);

    return () => {
      socketService.offNewSOS(handleNewSOS);
      socketService.offSOSStatusUpdate(handleStatusUpdate);
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  const handleSelect = useCallback((alert: SOSAlert) => {
    setSelectedAlert(alert);
    setActiveTab("feed");
  }, []);

  const handleStatusChange = useCallback((id: string, status: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a._id === id ? { ...a, status: status as SOSAlert["status"] } : a
      )
    );
  }, []);

  const pendingCount = alerts.filter((a) => a.status === "Verification Pending").length;

  const stats = {
    total: alerts.length,
    pending: alerts.filter((a) => a.status === "Verification Pending").length,
    dispatched: alerts.filter((a) => a.status === "Dispatched").length,
    resolved: alerts.filter((a) => a.status === "Resolved").length,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emergency" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar alertCount={pendingCount} />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 flex overflow-hidden">
          <div className="w-80 xl:w-96 border-r border-border shrink-0 overflow-hidden">
            <SOSList
              alerts={alerts}
              selectedId={selectedAlert?._id ?? null}
              onSelect={handleSelect}
              onStatusChange={handleStatusChange}
            />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === "feed" || activeTab === "map" ? (
              <>
                <div className="h-12 border-b border-border bg-card flex items-center gap-6 px-4">
                  <StatBadge
                    icon={<AlertTriangle className="h-3.5 w-3.5" />}
                    label="Total"
                    value={stats.total}
                    color="foreground"
                  />
                  <StatBadge
                    icon={<Clock className="h-3.5 w-3.5" />}
                    label="Pending"
                    value={stats.pending}
                    color="emergency"
                  />
                  <StatBadge
                    icon={<MapPin className="h-3.5 w-3.5" />}
                    label="Dispatched"
                    value={stats.dispatched}
                    color="warning"
                  />
                  <StatBadge
                    icon={<CheckCircle className="h-3.5 w-3.5" />}
                    label="Resolved"
                    value={stats.resolved}
                    color="success"
                  />
                </div>

                <div className="flex-1 relative">
                  <LiveMap
                    alerts={alerts}
                    focusedAlert={selectedAlert}
                    onMarkerClick={handleSelect}
                  />
                </div>
              </>
            ) : activeTab === "stats" ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p className="text-sm font-mono">Statistics module — coming soon</p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p className="text-sm font-mono">Settings module — coming soon</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const StatBadge = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) => (
  <div className="flex items-center gap-1.5">
    <span className={`text-${color}`}>{icon}</span>
    <span className="text-xs text-muted-foreground">{label}:</span>
    <span className={`text-sm font-mono font-bold text-${color}`}>{value}</span>
  </div>
);

export default PoliceDashboard;
