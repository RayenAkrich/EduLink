import "source-map-support/register";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import { activitiesRoutes } from "./routes/activities";
import { notesRoutes } from "./routes/notes";
import authRoutes from "./routes/auth";
import { dashboardRoutes } from "./routes/dashboard";
import { messagesRoutes } from "./routes/messages";
import { notificationsRoutes } from "./routes/notifications";
import { announcementsRoutes } from "./routes/announcements";
import { classesRoutes } from "./routes/classes";
import { studentsRoutes } from "./routes/students";
import { activitesRoutes } from "./routes/activites";
import { absencesRoutes } from "./routes/absences";
import errorHandler from "./middleware/errorHandler";
import usersRoutes from "./routes/users";
import metricsRouter from "./routes/metrics"; 
dotenv.config();

declare const process: any;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const activeUsers = new Map<number, string>();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId: number) => {
    // Validate userId is a valid number
    if (!userId || userId === 0 || isNaN(userId)) {
      console.error(`Invalid userId received: ${userId} from socket ${socket.id}`);
      return;
    }
    
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

app.set("io", io);
app.set("activeUsers", activeUsers);

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.json({ status: "ok" }));



// Auth routes

app.use("/dashboard",dashboardRoutes);
// Other routes
// Routes
app.use("/activities", activitiesRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/activites", activitesRoutes);
app.use("/api/absences", absencesRoutes);
app.use("/api/metrics", metricsRouter);


app.use(errorHandler);

const PORT: number = Number(process.env.PORT) || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;