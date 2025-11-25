import "source-map-support/register";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import { activitiesRoutes } from "./routes/activities";
import { notesRoutes } from "./routes/notes";
import authRoutes from "./routes/auth";
import { messagesRoutes } from "./routes/messages";
import { notificationsRoutes } from "./routes/notifications";
import { announcementsRoutes } from "./routes/announcements";
import errorHandler from "./middleware/errorHandler";

dotenv.config();

declare const process: any;

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store active users: { userId: socketId }
const activeUsers = new Map<number, string>();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User registers with their ID
  socket.on("register", (userId: number) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove user from active users
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io accessible to routes
app.set("io", io);
app.set("activeUsers", activeUsers);

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_, res) => res.json({ status: "ok" }));

// Routes
app.use("/activities", activitiesRoutes);
app.use("/notes", notesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/announcements", announcementsRoutes);

// Error handler — MUST be last
app.use(errorHandler);

const PORT: number = Number(process.env.PORT) || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;