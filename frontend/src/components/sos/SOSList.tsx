import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { SOSAlert, SOSStatus } from "../../types/sos";
import SOSCard from "./SOSCard";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";

interface SOSListProps {
  alerts: SOSAlert[];
  selectedId: string | null;
  onSelect: (alert: SOSAlert) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const filterOptions: { label: string; value: SOSStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "Verification Pending" },
  { label: "Dispatched", value: "Dispatched" },
  { label: "Resolved", value: "Resolved" },
];

const SOSList = ({ alerts, selectedId, onSelect, onStatusChange }: SOSListProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SOSStatus | "all">("all");

  const filtered = alerts.filter((a) => {
    const matchesSearch =
      (a.user?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.user?.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      a.dispatchId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = alerts.filter((a) => a.status === "Verification Pending").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">SOS Alerts</h2>
          {pendingCount > 0 && (
            <span className="text-xs font-mono text-emergency animate-pulse-emergency">
              {pendingCount} ACTIVE
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-secondary border-border"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                "px-2 py-1 text-[10px] font-mono rounded transition-colors",
                statusFilter === opt.value
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Filter className="h-6 w-6 mb-2" />
            <p className="text-xs">No alerts found</p>
          </div>
        ) : (
          filtered.map((alert) => (
            <SOSCard
              key={alert._id}
              alert={alert}
              isSelected={selectedId === alert._id}
              onSelect={onSelect}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SOSList;
