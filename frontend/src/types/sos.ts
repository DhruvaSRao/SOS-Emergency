export interface SOSAlert {
  _id: string;
  dispatchId: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  status: "Verification Pending" | "Dispatched" | "Resolved";
  audioUrl?: string | null;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export type SOSStatus = SOSAlert["status"];

export const STATUS_LABELS: Record<SOSStatus, string> = {
  "Verification Pending": "Pending",
  "Dispatched": "Dispatched",
  "Resolved": "Resolved",
};

export const STATUS_COLORS: Record<SOSStatus, string> = {
  "Verification Pending": "emergency",
  "Dispatched": "warning",
  "Resolved": "success",
};
