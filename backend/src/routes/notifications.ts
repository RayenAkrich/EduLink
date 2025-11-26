import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// Get all notifications for current user
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id_user;

    const notifications = await prisma.notification.findMany({
      where: { id_user: userId },
      orderBy: { date_creation: 'desc' },
      take: 50 // Limit to last 50 notifications
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get unread count
router.get("/unread-count", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id_user;

    const count = await prisma.notification.count({
      where: {
        id_user: userId,
        lu: false
      }
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Mark notification as read
router.put("/:id/read", authMiddleware, async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user!.id_user;

    const notification = await prisma.notification.updateMany({
      where: {
        id_notification: notificationId,
        id_user: userId
      },
      data: { lu: true }
    });

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Mark all notifications as read
router.put("/read-all", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id_user;

    await prisma.notification.updateMany({
      where: {
        id_user: userId,
        lu: false
      },
      data: { lu: true }
    });

    res.json({ success: true, message: "Toutes les notifications ont été marquées comme lues" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Delete notification
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user!.id_user;

    await prisma.notification.deleteMany({
      where: {
        id_notification: notificationId,
        id_user: userId
      }
    });

    res.json({ success: true, message: "Notification supprimée" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export { router as notificationsRoutes };

// Migration endpoint: convert older message notifications to use sender's name
// Admin-only for convenience during migration/testing. Remove or protect in production.
router.post("/migrate-message-sender-names", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    // Find all message notifications that likely contain an email in content (contains '@')
    const notifications = await prisma.notification.findMany({
      where: { type: "message", contenu: { contains: "@" } },
      take: 1000
    });

    let updatedCount = 0;
    const updatedNotifications: any[] = [];

    for (const notif of notifications) {
      if (!notif.reference_id) continue;

      const message = await prisma.message.findUnique({
        where: { id_message: notif.reference_id },
        include: { expediteur: { select: { id_user: true, nom: true, email: true } } }
      });

      if (!message) continue;

      const name = message.expediteur?.nom || message.expediteur?.email || "Utilisateur";

      const newTitre = `Nouveau message de ${name}`;
      const newContenu = `${name} vous a envoyé un message`;

      const updated = await prisma.notification.update({
        where: { id_notification: notif.id_notification },
        data: { titre: newTitre, contenu: newContenu }
      });

      updatedNotifications.push(updated);
      updatedCount++;
    }

    res.json({ success: true, data: { updatedCount, samples: updatedNotifications.slice(0, 10) } });
  } catch (error) {
    console.error("Error migrating message notification names:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Also allow migration of announcement notifications to include author name
router.post("/migrate-announcement-sender-names", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const notifications = await prisma.notification.findMany({
      where: { type: "announcement", titre: { contains: "Nouvelle annonce" } },
      take: 1000
    });

    let updatedCount = 0;
    const updatedNotifications: any[] = [];

    for (const notif of notifications) {
      if (!notif.reference_id) continue;

      const announcement = await prisma.annonce.findUnique({
        where: { id_annonce: notif.reference_id },
        include: { auteur: { select: { id_user: true, nom: true, email: true } } }
      });

      if (!announcement) continue;

      const name = announcement.auteur?.nom || announcement.auteur?.email || "Utilisateur";
      const newTitre = `Nouvelle annonce de ${name}`;
      const newContenu = `${name} : ${announcement.titre}`;

      const updated = await prisma.notification.update({
        where: { id_notification: notif.id_notification },
        data: { titre: newTitre, contenu: newContenu }
      });

      updatedNotifications.push(updated);
      updatedCount++;
    }

    res.json({ success: true, data: { updatedCount, samples: updatedNotifications.slice(0, 10) } });
  } catch (error) {
    console.error("Error migrating announcement notification names:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});