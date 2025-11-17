import express from "express";

const router = express.Router();

// Create an absence
router.post("/", (req: any, res: any) => {
	// TODO: persist absence with Prisma
	res.status(201).json({ message: "Absence recorded (stub)" });
});

// Get absences for a student
router.get("/:eleveId", (req: any, res: any) => {
	const { eleveId } = req.params;
	// TODO: fetch from DB
	res.json({ message: `List absences for eleve ${eleveId} (stub)` });
});

// Stats endpoint
router.get("/stats", (req: any, res: any) => {
	// TODO: compute stats
	res.json({ justifie: 0, nonJustifie: 0 });
});

export default router;
