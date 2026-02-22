import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMySOS } from "../services/api";
import { ArrowLeft, Clock, MapPin, Loader2 } from "lucide-react";
import { Badge } from "../components/ui/badge";

interface SOSRecord {
  _id: string;
  dispatchId: string;
  status: "Verification Pending" | "Dispatched" | "Resolved";
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  audioUrl?: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  "Verification Pending": "Pending",
  Dispatched: "Dispatched",
  Resolved: "Resolved",
};

const STATUS_COLORS: Record<string, string> = {
  "Verification Pending": "emergency",
  Dispatched: "warning",
  Resolved: "success",
};

const HistoryPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<SOSRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMySOS();
        const data = (res.data.data as SOSRecord[]).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAlerts(data);
      } catch {
        console.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emergency" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-card/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate("/calculator")}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold text-foreground">SOS History</h1>
        <span className="text-xs text-muted-foreground font-mono ml-auto">
          {alerts.length} total
        </span>
      </div>

      {/* List */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No SOS history yet</p>
            <p className="text-xs mt-1 text-muted-foreground/60">
              Your emergency alerts will appear here
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <HistoryCard key={alert._id} alert={alert} />
          ))
        )}
      </div>
    </div>
  );
};

const HistoryCard = ({ alert }: { alert: SOSRecord }) => {
  const statusColor = STATUS_COLORS[alert.status] || "muted";
  const date = new Date(alert.createdAt);

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card animate-slide-in">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-muted-foreground font-mono font-bold">
            {alert.dispatchId}
          </p>
          <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">
            {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <Badge
          className={`text-[10px] font-mono bg-${statusColor}/10 text-${statusColor} border-${statusColor}/20 border`}
        >
          {STATUS_LABELS[alert.status]}
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        <span className="font-mono">
          {alert.location.coordinates[1].toFixed(4)}, {alert.location.coordinates[0].toFixed(4)}
        </span>
      </div>

      {alert.audioUrl && (
        <audio controls className="w-full mt-3 h-8" src={alert.audioUrl}>
          <track kind="captions" />
        </audio>
      )}
    </div>
  );
};

export default HistoryPage;
