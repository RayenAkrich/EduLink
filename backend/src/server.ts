// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { activitiesRoutes } from "./routes/activities";

dotenv.config();

// Minimal shim to avoid requiring @types/node in this quick fix
declare const process: any;

const app = express();

app.use(cors());
app.use(express.json());


// Health check
app.get("/", (req,res) => res.json({ status: "ok" }));
app.use('/activities',activitiesRoutes)


const PORT: number = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
