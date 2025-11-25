import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(userId: number) {
    if (this.socket?.connected) {
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    
    this.socket = io(SOCKET_URL, {
      query: { userId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.socket?.emit("register", userId);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Set up event listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback?: Function) {
    if (callback) {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      this.socket?.off(event, callback as any);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();