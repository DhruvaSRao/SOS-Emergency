import React, { useRef, useState } from "react";
import { Play, Pause, Volume2, Clock, MapPin, Mail, User } from "lucide-react";
import { cn } from "../../lib/utils";
import { SOSAlert, STATUS_LABELS, STATUS_COLORS } from "../../types/sos";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { updateSOSStatus } from "../../services/api";

interface SOSCardProps {
  alert: SOSAlert;
  isSelected: boolean;
  onSelect: (alert: SOSAlert) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const SOSCard = ({ alert, isSelected, onSelect, onStatusChange }: SOSCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const statusColor = STATUS_COLORS[alert.status];
  const timeAgo = getTimeAgo(alert.createdAt);
  const lat = alert.location.coordinates[1];
  const lng = alert.location.coordinates[0];

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!alert.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(alert.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStatusUpdate = async (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      await updateSOSStatus(alert._id, newStatus);
      onStatusChange?.(alert._id, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(alert)}
      className={cn(
        "p-3 border rounded-lg cursor-pointer transition-all animate-slide-in",
        "hover:border-muted-foreground/30",
        isSelected
          ? "border-emergency/50 bg-emergency/5 glow-red"
          : "border-border bg-card",
        alert.status === "Verification Pending" && !isSelected && "border-emergency/20"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">
            {alert.user?.name ?? "Unknown"}
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-mono uppercase",
            statusColor === "emergency" && "border-emergency/50 text-emergency",
            statusColor === "warning" && "border-warning/50 text-warning",
            statusColor === "success" && "border-success/50 text-success",
          )}
        >
          {STATUS_LABELS[alert.status]}
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span className="font-mono">{alert.user?.email ?? "—"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="font-mono">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Dispatch ID */}
      <p className="text-[10px] font-mono text-muted-foreground mb-2">
        ID: {alert.dispatchId}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {alert.audioUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={toggleAudio}
            className="h-7 text-xs gap-1"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <Volume2 className="h-3 w-3" />
          </Button>
        )}

        {alert.status === "Verification Pending" && (
          <Button
            size="sm"
            onClick={(e) => handleStatusUpdate(e, "Dispatched")}
            disabled={isUpdating}
            className="h-7 text-xs bg-warning text-accent-foreground hover:bg-warning/90"
          >
            Dispatch
          </Button>
        )}

        {alert.status === "Dispatched" && (
          <Button
            size="sm"
            onClick={(e) => handleStatusUpdate(e, "Resolved")}
            disabled={isUpdating}
            className="h-7 text-xs bg-success text-success-foreground hover:bg-success/90"
          >
            Resolve
          </Button>
        )}
      </div>
    </div>
  );
};

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default SOSCard;
