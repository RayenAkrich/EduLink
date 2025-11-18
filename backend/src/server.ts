// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import messageRoutes, { registerMessageSocket } from "./routes/message";


dotenv.config();

// Minimal shim to avoid requiring @types/node in this quick fix
declare const process: any;

const app: any = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Attach io to req so routes can use it
app.use((req: any, res: any, next: any) => {
  req.io = io;
  next();
});

// Register Socket.io events
registerMessageSocket(io);

// Health check
app.get("/", (req: any, res: any) => res.json({ status: "ok" }));
// message routes
app.use("/messages",messageRoutes);


const PORT: number = Number(process.env.PORT) || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
