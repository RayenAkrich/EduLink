import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const userId = localStorage.getItem("id_user");
    socket = io("http://localhost:5000", {
      query: { userId },
      transports: ["websocket"],
    });
  }
  return socket;
};

export { socket };
