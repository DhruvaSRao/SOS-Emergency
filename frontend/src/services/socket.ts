import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    const token = localStorage.getItem("auth_token");

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    this.socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  onNewSOS(callback: (data: any) => void) {
    this.socket?.on("new-sos", callback);
  }

  onSOSStatusUpdate(callback: (data: any) => void) {
    this.socket?.on("sos-status-update", callback);
  }

  onSOSLocationUpdate(callback: (data: any) => void) {
    this.socket?.on("sos-location-update", callback);
  }

  offNewSOS(callback?: (data: any) => void) {
    this.socket?.off("new-sos", callback);
  }

  offSOSStatusUpdate(callback?: (data: any) => void) {
    this.socket?.off("sos-status-update", callback);
  }

  offSOSLocationUpdate(callback?: (data: any) => void) {
    this.socket?.off("sos-location-update", callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
export default socketService;
