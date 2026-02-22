import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SOSAlert, STATUS_LABELS } from "../../types/sos";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createIcon = (status: string) => {
  const color =
    status === "Verification Pending"
      ? "#ef4444"
      : status === "Dispatched"
      ? "#f59e0b"
      : status === "Resolved"
      ? "#22c55e"
      : "#6b7280";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 24px; height: 24px; border-radius: 50%;
        background: ${color}; border: 3px solid rgba(255,255,255,0.9);
        box-shadow: 0 0 12px ${color}80, 0 2px 8px rgba(0,0,0,0.5);
        ${status === "Verification Pending" ? "animation: pulse 1.5s ease-in-out infinite;" : ""}
      "></div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 12px ${color}80; }
          50% { transform: scale(1.3); box-shadow: 0 0 24px ${color}; }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface FlyToProps {
  center: [number, number] | null;
}

const FlyToMarker = ({ center }: FlyToProps) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
};

interface LiveMapProps {
  alerts: SOSAlert[];
  focusedAlert: SOSAlert | null;
  onMarkerClick: (alert: SOSAlert) => void;
}

const LiveMap = ({ alerts, focusedAlert, onMarkerClick }: LiveMapProps) => {
  const defaultCenter: [number, number] = [20.5937, 78.9629]; // India center
  const focusCoords: [number, number] | null = focusedAlert
    ? [focusedAlert.location.coordinates[1], focusedAlert.location.coordinates[0]]
    : null;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={5}
      className="h-full w-full rounded-lg"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToMarker center={focusCoords} />

      {alerts.map((alert) => {
        const pos: [number, number] = [
          alert.location.coordinates[1],
          alert.location.coordinates[0],
        ];
        return (
          <Marker
            key={alert._id}
            position={pos}
            icon={createIcon(alert.status)}
            eventHandlers={{
              click: () => onMarkerClick(alert),
            }}
          >
            <Popup>
              <div className="text-xs space-y-1" style={{ color: "#1a1a2e" }}>
                <p className="font-bold">{alert.user?.name ?? "Unknown"}</p>
                <p>{alert.user?.email ?? "—"}</p>
                <p>{alert.dispatchId}</p>
                <p>{STATUS_LABELS[alert.status]}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LiveMap;
