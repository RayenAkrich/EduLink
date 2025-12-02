import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";

const prisma = new PrismaClient();
const router = Router();

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const [
      totalUsers,
      totalClasses,
      totalActivites,
      totalAnnonces,
      totalEleves,
      totalNotes,
      totalAbsences,
      totalMessages,
      totalNotifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.classe.count(),
      prisma.activite.count(),
      prisma.annonce.count(),
      prisma.eleve.count(),
      prisma.note.count(),
      prisma.absence.count(),
      prisma.message.count(),
      prisma.notification.count(),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalClasses,
        totalActivites,
        totalAnnonces,
        totalEleves,
        totalNotes,
        totalAbsences,
        totalMessages,
        totalNotifications,
      },
    });
  } catch (err) {
    console.error("metrics error:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export default router;