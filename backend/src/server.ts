// src/server.ts
import "source-map-support/register"
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { activitiesRoutes } from "./routes/activities";
import errorHandler from "./middleware/errorHandler";
import { notesRoutes } from "./routes/notes";
import authRoutes from "./routes/auth";
import { dashboardRoutes } from "./routes/dashboard";

dotenv.config();

// Minimal shim to avoid requiring @types/node in this quick fix
declare const process: any;

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req,res) => res.json({ status: "ok" }));
app.use('/activities',activitiesRoutes)
app.use('/notes',notesRoutes)
app.use(errorHandler)


// Auth routes
app.use("/api/auth", authRoutes);
app.use("/dashboard",dashboardRoutes);
// Other routes
app.use("/activities", activitiesRoutes);

const PORT: number = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
