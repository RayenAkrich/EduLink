import "source-map-support/register";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { activitiesRoutes } from "./routes/activities";
import { notesRoutes } from "./routes/notes";
import authRoutes from "./routes/auth";
import errorHandler from "./middleware/errorHandler";

dotenv.config();

declare const process: any;

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_, res) => res.json({ status: "ok" }));

// Routes
app.use("/activities", activitiesRoutes);
app.use("/notes", notesRoutes);
app.use("/api/auth", authRoutes);

// Error handler — MUST be last
app.use(errorHandler);

const PORT: number = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
